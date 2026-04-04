import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { User } from "../src/models/User.js";
import { authHeaders, createUser } from "./helpers/factories.js";

describe("auth routes", () => {
  it("registers a new user and returns a token with the safe user payload", async () => {
    const response = await request(app).post("/api/auth/register").send({
      fullName: "Niyati Kayastha",
      email: "niyati@example.com",
      password: "Password123!"
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      fullName: "Niyati Kayastha",
      email: "niyati@example.com",
      role: "user",
      isActive: true
    });

    const savedUser = await User.findOne({ email: "niyati@example.com" }).lean();
    expect(savedUser.passwordHash).not.toBe("Password123!");
  });

  it("rejects invalid login credentials", async () => {
    await createUser({
      email: "login@example.com",
      password: "Password123!"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "WrongPassword!"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });

  it("returns the current user for a valid authenticated session", async () => {
    const user = await createUser({
      fullName: "Current User",
      email: "current@example.com"
    });

    const response = await request(app).get("/api/auth/me").set(authHeaders(user));

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      fullName: "Current User",
      email: "current@example.com"
    });
    expect(response.body.user.passwordHash).toBeUndefined();
  });
});
