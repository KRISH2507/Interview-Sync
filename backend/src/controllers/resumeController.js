import Resume from "../models/Resume.js";
import User from "../models/User.js";
import geminiClient from "../config/ai.js";
import mammoth from "mammoth";

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let rawText = "";

    try {
      if (file.mimetype === "application/pdf") {
        return res.status(400).json({ 
          message: "PDF support coming soon. Please upload a DOCX file or provide text directly." 
        });
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        rawText = result.value;
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please use DOCX." });
      }
    } catch (fileError) {
      console.error("File parsing error:", fileError);
      return res.status(400).json({ message: "Failed to parse file" });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ message: "Resume text too short (minimum 50 characters)" });
    }

    let analysis;
    
    if (geminiClient) {
      try {
        console.log("Calling Gemini API for resume analysis...");
        
        const prompt = `Analyze this resume and return ONLY a valid JSON object with these exact fields:
{
  "skills": ["skill1", "skill2", "skill3"],
  "experienceYears": 3,
  "projects": ["project1", "project2"],
  "strengths": ["strength1", "strength2"]
}

Resume text:
${rawText.substring(0, 3000)}

Return ONLY the JSON object, no other text.`;

        const aiResponse = await geminiClient.generateContent(prompt);
        console.log("Gemini API response received");
        
        let jsonText = aiResponse.trim();
        if (jsonText.includes('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }
        
        analysis = JSON.parse(jsonText.trim());
        console.log("AI Analysis successful:", analysis);
      } catch (aiError) {
        console.warn("AI analysis failed, using fallback:", aiError.message);
        analysis = null;
      }
    }
    
    if (!analysis) {
      console.log("Using simple text analysis (no AI)...");
      
      const textLower = rawText.toLowerCase();
      
      const commonSkills = [
        'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'html', 'css',
        'sql', 'mongodb', 'express', 'angular', 'vue', 'git', 'docker', 'kubernetes',
        'aws', 'azure', 'machine learning', 'data science', 'ai', 'api', 'rest',
        'agile', 'scrum', 'leadership', 'communication', 'problem solving'
      ];
      
      const foundSkills = commonSkills.filter(skill => 
        textLower.includes(skill.toLowerCase())
      );
      
      let experienceYears = 0;
      const yearMatches = rawText.match(/(\d+)\s*(years?|yrs?)\s*(of)?\s*(experience|exp)/gi);
      if (yearMatches && yearMatches.length > 0) {
        const numbers = yearMatches[0].match(/\d+/);
        if (numbers) experienceYears = parseInt(numbers[0]);
      }
      
      const projectKeywords = ['project', 'developed', 'built', 'created', 'designed', 'implemented'];
      const projects = [];
      const lines = rawText.split('\n');
      for (const line of lines) {
        const lineLower = line.toLowerCase();
        if (projectKeywords.some(kw => lineLower.includes(kw)) && line.trim().length > 20) {
          projects.push(line.trim().substring(0, 100));
          if (projects.length >= 3) break;
        }
      }
      
      const strengths = [];
      if (foundSkills.length > 5) strengths.push('Diverse technical skill set');
      if (experienceYears > 2) strengths.push('Experienced professional');
      if (projects.length > 0) strengths.push('Hands-on project experience');
      if (textLower.includes('lead') || textLower.includes('manage')) {
        strengths.push('Leadership experience');
      }
      if (strengths.length === 0) {
        strengths.push('Strong communication skills', 'Quick learner');
      }
      
      analysis = {
        skills: foundSkills.length > 0 ? foundSkills.slice(0, 10) : ['General IT skills'],
        experienceYears: experienceYears || 1,
        projects: projects.length > 0 ? projects : ['Professional work experience'],
        strengths: strengths
      };
      
      console.log("Fallback analysis complete:", analysis);
    }

    let score = 0;
    if (analysis.skills?.length > 0) score += 25;
    if (analysis.experienceYears > 0) score += 25;
    if (analysis.projects?.length > 0) score += 25;
    if (analysis.strengths?.length > 0) score += 25;

    const resume = await Resume.create({
      user: userId,
      rawText,
      score,
      analysis,
    });

    await User.findByIdAndUpdate(userId, {
      skills: analysis.skills || [],
    });

    res.status(201).json({
      message: "Resume uploaded and analyzed successfully",
      score,
      analysis,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Resume processing failed", error: error.message });
  }
};
