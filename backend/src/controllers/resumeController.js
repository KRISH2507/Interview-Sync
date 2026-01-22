import Resume from "../models/Resume.js";
import User from "../models/User.js";
import openai from "../services/openai.js";
import mammoth from "mammoth";

/* ================= UPLOAD & ANALYZE RESUME ================= */

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ JWT-based
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    /* ================= EXTRACT TEXT FROM FILE ================= */
    let rawText = "";

    try {
      if (file.mimetype === "application/pdf") {
        // For PDF, we'll need pdf-parse installed properly
        // For now, return a message asking for DOCX or text
        return res.status(400).json({ 
          message: "PDF support coming soon. Please upload a DOCX file or provide text directly." 
        });
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Parse DOCX
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

    /* ================= AI ANALYSIS ================= */

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyzer.",
        },
        {
          role: "user",
          content: `
Analyze this resume and return JSON with:
- skills (array of strings)
- experienceYears (number)
- projects (array of strings)
- strengths (array of strings)

Resume:
${rawText}
          `,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(
      aiResponse.choices[0].message.content
    );

    /* ================= PRACTICAL RESUME SCORE ================= */

    let score = 0;
    if (analysis.skills?.length > 0) score += 25;
    if (analysis.experienceYears > 0) score += 25;
    if (analysis.projects?.length > 0) score += 25;
    if (analysis.strengths?.length > 0) score += 25;

    /* ================= SAVE RESUME ================= */

    const resume = await Resume.create({
      user: userId,
      rawText,
      score,
      analysis,
    });

    /* ================= UPDATE USER PROFILE ================= */

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
