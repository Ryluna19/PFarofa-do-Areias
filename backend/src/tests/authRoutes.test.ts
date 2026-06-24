import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pool } from "../database/pool.js";
import { createApp } from "../app.js";

const TEST_JWT_SECRET = "farofa-test-jwt-secret";

process.env.JWT_SECRET = TEST_JWT_SECRET;

describe("POST /api/auth/login", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a token for valid admin credentials", async () => {
    const passwordHash = await bcrypt.hash("admin12345", 10);

    // Simulates the database result without connecting to PostgreSQL.
    const querySpy = vi.spyOn(pool, "query").mockResolvedValue({
      rows: [
        {
          id: 1,
          fullName: "Administrador",
          email: "admin@farofadoareias.local",
          passwordHash,
        },
      ],
    } as never);

    const response = await request(createApp()).post("/api/auth/login").send({
      email: "admin@farofadoareias.local",
      password: "admin12345",
    });

    expect(response.status).toBe(200);

    expect(response.body.admin).toEqual({
      id: 1,
      fullName: "Administrador",
      email: "admin@farofadoareias.local",
    });

    expect(response.body.token).toEqual(expect.any(String));

    const decodedToken = jwt.verify(response.body.token, TEST_JWT_SECRET);

    expect(decodedToken).toMatchObject({
      email: "admin@farofadoareias.local",
      role: "admin",
      sub: "1",
    });

    expect(querySpy).toHaveBeenCalledTimes(1);
  });

  it("rejects an incorrect password", async () => {
    const passwordHash = await bcrypt.hash("admin12345", 10);

    // Returns an existing admin with a different password hash.
    vi.spyOn(pool, "query").mockResolvedValue({
      rows: [
        {
          id: 1,
          fullName: "Administrador",
          email: "admin@farofadoareias.local",
          passwordHash,
        },
      ],
    } as never);

    const response = await request(createApp()).post("/api/auth/login").send({
      email: "admin@farofadoareias.local",
      password: "senha-errada",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Invalid email or password",
    });
  });

  it("rejects an unknown admin email", async () => {
    // Simulates a database search with no matching admin.
    vi.spyOn(pool, "query").mockResolvedValue({
      rows: [],
    } as never);

    const response = await request(createApp()).post("/api/auth/login").send({
      email: "naoexiste@farofadoareias.local",
      password: "admin12345",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Invalid email or password",
    });
  });

  it("requires both email and password", async () => {
    const response = await request(createApp()).post("/api/auth/login").send({
      email: "",
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Email and password are required",
    });
  });
});
