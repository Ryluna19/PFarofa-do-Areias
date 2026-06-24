import "dotenv/config";
import { Pool } from "pg";

// Loads the database settings required by the API.
function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const pool = new Pool({
  user: getRequiredEnv("DB_USER"),
  host: getRequiredEnv("DB_HOST"),
  database: getRequiredEnv("DB_NAME"),
  password: getRequiredEnv("DB_PASSWORD"),
  port: Number(getRequiredEnv("DB_PORT")),
});
