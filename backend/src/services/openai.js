import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let openai = null;

// Only initialize OpenAI if API key is available
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI client initialized successfully");
  } catch (error) {
    console.log("⚠️ Failed to initialize OpenAI client:", error.message);
  }
} else {
  console.log("⚠️ OpenAI API key not found or invalid, will use fallback methods");
}

export default openai;
