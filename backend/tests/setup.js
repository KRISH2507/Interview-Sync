import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServerPromise;

const ensureMongoServer = async () => {
  if (!globalThis.__MONGO_SERVER__) {
    if (!mongoServerPromise) {
      mongoServerPromise = MongoMemoryServer.create();
    }
    globalThis.__MONGO_SERVER__ = await mongoServerPromise;
  }

  return globalThis.__MONGO_SERVER__;
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.AUTH_COOKIE_SECURE = "false";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_123";
  process.env.ACCESS_TOKEN_TTL = "15m";
  process.env.REFRESH_TOKEN_TTL = "7d";
  process.env.ACCESS_TOKEN_COOKIE_NAME = "accessToken";
  process.env.REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
  process.env.AUTH_COOKIE_DOMAIN = "";
  process.env.FRONTEND_URL = "http://localhost:5173";
  process.env.FRONTEND_URLS = "http://localhost:5173";

  const mongoServer = await ensureMongoServer();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (globalThis.__MONGO_SERVER__) {
    await globalThis.__MONGO_SERVER__.stop();
    globalThis.__MONGO_SERVER__ = undefined;
    mongoServerPromise = undefined;
  }
});
