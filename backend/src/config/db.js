import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }

  let attempts = 0;
  const maxAttempts = 6;
  const delayMs = 5000;

  const tryConnect = async () => {
    attempts += 1;
    try {
      const conn = await mongoose.connect(uri, {
        // keep default options; mongoose will warn if additional options are needed
      });
      console.log("MongoDB Connected:", conn.connection.host);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection failed (attempt ${attempts}):`, error.message);
      if (attempts >= maxAttempts) {
        console.error(`Failed to connect after ${attempts} attempts. Exiting.`);
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
      return tryConnect();
    }
  };

  return tryConnect();
};
