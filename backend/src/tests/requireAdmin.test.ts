import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requireAdmin } from "../middleware/requireAdmin.js";

const TEST_JWT_SECRET = "farofa-test-jwt-secret";

process.env.JWT_SECRET = TEST_JWT_SECRET;

// Creates a small route protected by the real admin middleware.
function createProtectedApp() {
  const app = express();

  app.get("/protected", requireAdmin, (_request, response) => {
    return response.status(200).json({
      adminId: response.locals.adminId,
    });
  });

  return app;
}

describe("requireAdmin middleware", () => {
  it("rejects requests without a token", async () => {
    const response = await request(createProtectedApp()).get("/protected");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Authentication token is required",
    });
  });

  it("rejects malformed authorization headers", async () => {
    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Authorization", "Basic invalid-token");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Invalid authentication token",
    });
  });

  it("rejects invalid tokens", async () => {
    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Invalid or expired authentication token",
    });
  });

  it("rejects authenticated users without the admin role", async () => {
    const token = jwt.sign(
      {
        role: "customer",
      },
      TEST_JWT_SECRET,
      {
        subject: "1",
        expiresIn: "1h",
      },
    );

    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      error: "Admin access is required",
    });
  });

  it("allows authenticated administrators", async () => {
    const token = jwt.sign(
      {
        email:
          "[admin@farofadoareias.local](mailto:admin@farofadoareias.local)",
        role: "admin",
      },
      TEST_JWT_SECRET,
      {
        subject: "1",
        expiresIn: "1h",
      },
    );

    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      adminId: 1,
    });
  });
});
