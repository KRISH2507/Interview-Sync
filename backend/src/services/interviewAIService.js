import openai from "../services/openai.js";

/**
 * Safely extract JSON array from text
 */
function extractJSONArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function generateInterviewQuestions(resumeText) {
  try {
    // Check if OpenAI is available
    if (!openai) {
      console.log("OpenAI not configured, skipping AI generation");
      return null;
    }

    const prompt = `
You are a senior software engineering interviewer.

Generate EXACTLY 5 high-quality MCQ interview questions based on the resume below.

STRICT RULES:
- Output ONLY a valid JSON array
- No explanations, no markdown, no text outside JSON
- No beginner or syntax questions
- Focus on real-world engineering, debugging, performance, architecture
- Each question must have:
  - question (string)
  - options (array of 4 strings)
  - correctAnswerIndex (0-3)
  - difficulty (easy | medium | hard)
  - topic (string)

If you cannot generate questions, return an empty JSON array [].

RESUME:
"""
${resumeText.slice(0, 2000)}
"""
`;

    console.log("🤖 Calling OpenAI to generate interview questions...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer who generates challenging, resume-specific interview questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Higher temperature for more variety
    });

    const content = response.choices[0].message.content;
    console.log("📝 OpenAI response received");

    // Try to parse as JSON object first (OpenAI might wrap in object)
    let parsed;
    try {
      const jsonObj = JSON.parse(content);
      // If it's an object with a questions array, extract it
      if (jsonObj.questions && Array.isArray(jsonObj.questions)) {
        parsed = jsonObj.questions;
      } else if (Array.isArray(jsonObj)) {
        parsed = jsonObj;
      } else {
        // Try to extract array from the object
        parsed = extractJSONArray(content);
      }
    } catch {
      parsed = extractJSONArray(content);
    }

    if (Array.isArray(parsed) && parsed.length >= 5) {
      console.log("✅ AI generated 5 questions successfully");
      return parsed.slice(0, 5); // Ensure exactly 5 questions
    }

    console.log("⚠️ AI returned invalid format, falling back to preseeded questions");
    return null;
  } catch (err) {
    console.error("AI generation error:", err.message);
    return null;
  }
}
