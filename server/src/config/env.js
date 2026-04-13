import dotenv from "dotenv";

dotenv.config();

const requiredKeys = ["MONGODB_URI", "JWT_SECRET"];

requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  aiMode: process.env.AI_MODE || "internal",
  pythonAiUrl: process.env.PYTHON_AI_URL || "",
  backupEnabled: process.env.BACKUP_ENABLED === "true",
  resourceUrl:
    process.env.RESOURCE_URL ||
    "https://www.opencounseling.com/suicide-hotlines",
  seedDemoAccounts: process.env.SEED_DEMO_ACCOUNTS !== "false",
  demoAdminEmail: process.env.DEMO_ADMIN_EMAIL || "admin@wellbeing.local",
  demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD || "Admin123!",
  demoHelperEmail: process.env.DEMO_HELPER_EMAIL || "helper@wellbeing.local",
  demoHelperPassword: process.env.DEMO_HELPER_PASSWORD || "Helper123!"
};

