import { Badge } from "../models/Badge.js";
import { Prompt } from "../models/Prompt.js";
import { Suggestion } from "../models/Suggestion.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { BADGE_SEED, PROMPT_SEED, ROLES, SUGGESTION_SEED } from "../utils/constants.js";

async function upsertSeedData(Model, records, uniqueKey) {
  await Promise.all(
    records.map((record) =>
      Model.findOneAndUpdate({ [uniqueKey]: record[uniqueKey] }, record, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      })
    )
  );
}

async function ensureDemoUser({ fullName, email, password, role }) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await User.hashPassword(password);

  return User.create({
    fullName,
    email,
    passwordHash,
    role,
    reminderEnabled: true
  });
}

export async function seedCoreData() {
  await upsertSeedData(Badge, BADGE_SEED, "slug");
  await upsertSeedData(Prompt, PROMPT_SEED, "text");
  await upsertSeedData(Suggestion, SUGGESTION_SEED, "mood");

  if (env.seedDemoAccounts) {
    await ensureDemoUser({
      fullName: "System Admin",
      email: env.demoAdminEmail,
      password: env.demoAdminPassword,
      role: ROLES.ADMIN
    });

    await ensureDemoUser({
      fullName: "Support Helper",
      email: env.demoHelperEmail,
      password: env.demoHelperPassword,
      role: ROLES.HELPER
    });
  }
}

