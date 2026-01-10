import User from "../models/User.js";
import Resume from "../models/Resume.js";
import { parseResume } from "../services/resumeParser.js";

export const uploadResume = async (req, res) => {
  try {
    const { name, email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email });
    }

    const rawText = await parseResume(file.path, file.mimetype);

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ message: "Failed to read resume text" });
    }

    const resume = await Resume.create({
      user: user._id,
      rawText,
      summary: rawText.slice(0, 1500),
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      userId: user._id,
      resumeId: resume._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resume upload failed" });
  }
};
