import path from "node:path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wellbeing-journal-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.AI_MODE = process.env.AI_MODE || "off";
process.env.PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://127.0.0.1:8000/analyze";
process.env.RESOURCE_URL = process.env.RESOURCE_URL || "https://example.com/support";
process.env.SEED_DEMO_ACCOUNTS = "false";
process.env.MONGOMS_PREFER_GLOBAL_PATH = "false";
process.env.MONGOMS_DOWNLOAD_DIR =
  process.env.MONGOMS_DOWNLOAD_DIR || path.resolve(process.cwd(), ".cache", "mongodb-binaries");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    autoIndex: true
  });
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
  vi.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
