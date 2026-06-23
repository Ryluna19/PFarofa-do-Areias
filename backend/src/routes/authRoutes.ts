import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database/pool.js";

type AdminRow = {
id: number;
fullName: string;
email: string;
passwordHash: string;
};

function getJwtSecret() {
const secret = process.env.JWT_SECRET;

if (!secret) {
throw new Error("Missing environment variable: JWT_SECRET");
}

return secret;
}

export const authRouter = Router();

authRouter.post("/login", async (request, response) => {
try {
const body = request.body as {
email?: unknown;
password?: unknown;
};


if (
  typeof body.email !== "string" ||
  typeof body.password !== "string"
) {
  return response.status(400).json({
    error: "Email and password are required",
  });
}

const email = body.email.trim().toLowerCase();
const password = body.password;

if (!email || !password) {
  return response.status(400).json({
    error: "Email and password are required",
  });
}

const result = await pool.query<AdminRow>(
  `
    SELECT
      id,
      full_name AS "fullName",
      email,
      password_hash AS "passwordHash"
    FROM admins
    WHERE email = $1
  `,
  [email]
);

const admin = result.rows[0];

if (!admin) {
  return response.status(401).json({
    error: "Invalid email or password",
  });
}

const passwordMatches = await bcrypt.compare(
  password,
  admin.passwordHash
);

if (!passwordMatches) {
  return response.status(401).json({
    error: "Invalid email or password",
  });
}

const token = jwt.sign(
  {
    email: admin.email,
    role: "admin",
  },
  getJwtSecret(),
  {
    subject: String(admin.id),
    expiresIn: "8h",
  }
);

return response.status(200).json({
  token,
  admin: {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
  },
});


} catch (error) {
console.error("Failed to authenticate admin:", error);


return response.status(500).json({
  error: "Unable to authenticate admin",
});


}
});
