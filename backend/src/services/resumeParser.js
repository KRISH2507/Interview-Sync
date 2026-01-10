import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function parseResume(filePath, mimeType) {
  if (!filePath) {
    throw new Error("File path not provided");
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });

    if (!result.value || !result.value.trim()) {
      return "Resume uploaded, but text extraction was limited. The document may contain complex formatting.";
    }

    return result.value;
  }

  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    if (!data.text || !data.text.trim()) {
      throw new Error("PDF text extraction failed");
    }

    return data.text;
  }

  throw new Error("Unsupported file format");
}
