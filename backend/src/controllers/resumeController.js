import Resume from "../models/Resume.js";
import User from "../models/User.js";
import geminiClient from "../config/ai.js";
import mammoth from "mammoth";
import fs from "fs";
import { invalidateDashboardCache } from "../utils/cache.js";
import { sendError, sendSuccess } from "../utils/response.js";

const extractJsonFromText = (text = "") => {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return null;
  }

  const withoutCodeFence = normalized
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const start = withoutCodeFence.indexOf("{");
  const end = withoutCodeFence.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const jsonSlice = withoutCodeFence.slice(start, end + 1);
  return JSON.parse(jsonSlice);
};

const isValidAnalysis = (analysis) =>
  analysis &&
  Array.isArray(analysis.skills) &&
  Array.isArray(analysis.projects) &&
  Array.isArray(analysis.strengths);

const parseResumeText = async (file) => {
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const fileName = String(file?.originalname || "").toLowerCase();
  const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");

  const hasBuffer = Buffer.isBuffer(file?.buffer);
  const hasPath = Boolean(file?.path);

  if (!isPdf && !isDocx) {
    throw new Error("Unsupported file type. Please use PDF or DOCX.");
  }

  if (!hasBuffer && !hasPath) {
    throw new Error("Uploaded file has no buffer/path. Ensure multer is configured and field name is 'resume'.");
  }

  if (isDocx) {
    const result = hasBuffer
      ? await mammoth.extractRawText({ buffer: file.buffer })
      : await mammoth.extractRawText({ path: file.path });
    return String(result?.value || "");
  }

  const pdfParseModule = await import("pdf-parse");
  const parsePdf = pdfParseModule?.default || pdfParseModule;
  const pdfBuffer = hasBuffer ? file.buffer : fs.readFileSync(file.path);
  const result = await parsePdf(pdfBuffer);
  return String(result?.text || "");
};

export const uploadResume = async (req, res) => {
  try {
    const userId = String(req.user.id); // ✅ FIX: always string
    const file = req.file;

    if (!file) {
      return sendError(res, 400, "No file uploaded");
    }

    let rawText = "";

    try {
      rawText = await parseResumeText(file);
    } catch (fileError) {
      console.error("File parsing error:", fileError);
      return sendError(res, 400, "Failed to parse file", {
        error: fileError?.message || "Unknown file parsing error",
        mimeType: file?.mimetype || "unknown",
        fileName: file?.originalname || "unknown",
        hasBuffer: Boolean(file?.buffer),
        hasPath: Boolean(file?.path),
      });
    }

    if (!rawText || rawText.trim().length < 50) {
      return sendError(res, 400, "Resume text too short (minimum 50 characters)");
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

        analysis = extractJsonFromText(aiResponse);
        if (!isValidAnalysis(analysis)) {
          throw new Error("Gemini response JSON missing required fields");
        }
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

    // ✅ FIX: pass userId as string to avoid Redis type error
    await invalidateDashboardCache(String(userId));

    return sendSuccess(res, 201, "Resume uploaded and analyzed successfully", {
      score,
      analysis,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return sendError(res, 500, "Resume processing failed", {
      error: error?.message || "Unknown resume processing error",
      stack: process.env.NODE_ENV === "production" ? undefined : error?.stack,
    });
  }
};