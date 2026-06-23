import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

type AdminTokenPayload = JwtPayload & {
  role?: unknown;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing environment variable: JWT_SECRET");
  }

  return secret;
}

export function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.header("authorization");

  if (!authorization) {
    return response.status(401).json({
      error: "Authentication token is required",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "Invalid authentication token",
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string") {
      return response.status(403).json({
        error: "Admin access is required",
      });
    }

    const payload = decoded as AdminTokenPayload;
    const adminId = Number(payload.sub);

    if (
      payload.role !== "admin" ||
      !Number.isInteger(adminId) ||
      adminId <= 0
    ) {
      return response.status(403).json({
        error: "Admin access is required",
      });
    }

    response.locals.adminId = adminId;

    return next();
  } catch {
    return response.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }
}