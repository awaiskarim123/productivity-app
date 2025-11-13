import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createAccessToken(
  app: FastifyInstance,
  payload: { id: string; email: string },
  expiresIn?: string,
): Promise<string> {
  const options = expiresIn ? { expiresIn } : undefined;
  return app.jwt.sign(payload, options);
}

