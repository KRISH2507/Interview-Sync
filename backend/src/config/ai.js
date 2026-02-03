import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let client = null;

if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  client = {
    generateContent: async (prompt) => {
      const model = genAI.getGenerativeModel({
        model: "models/gemini-pro",
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  };
} else {
  console.warn(
    "⚠️ GEMINI_API_KEY not found. Gemini AI is disabled."
  );
}

export default client;
