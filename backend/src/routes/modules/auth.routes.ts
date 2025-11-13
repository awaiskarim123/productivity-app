import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import ms from "ms";
import type { StringValue } from "ms";
import env from "../../config/env";
import { registerSchema, loginSchema, refreshSchema } from "../../schemas/auth.schema";
import { hashPassword, verifyPassword } from "../../utils/password";
import { createAccessToken, generateRefreshToken, hashToken } from "../../utils/token";

async function createTokenPair(app: FastifyInstance, user: { id: string; email: string }) {
  const accessToken = await createAccessToken(app, user, env.JWT_ACCESS_TOKEN_TTL);
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresInMs = ms(env.JWT_REFRESH_TOKEN_TTL as StringValue);

  if (!expiresInMs) {
    throw new Error("Invalid JWT_REFRESH_TOKEN_TTL value");
  }

  await app.prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: dayjs().add(expiresInMs, "milliseconds").toDate(),
    },
  });

  return { accessToken, refreshToken };
}

export default async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const result = registerSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const { email, password, name, dailyGoalMinutes } = result.data;
    const existing = await app.prisma.user.findUnique({ where: { email } });

    if (existing) {
      return reply.code(409).send({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);
    const user = await app.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        dailyGoalMinutes: dailyGoalMinutes ?? 300,
      },
    });

    const tokens = await createTokenPair(app, { id: user.id, email: user.email });

    return reply.code(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        dailyGoalMinutes: user.dailyGoalMinutes,
        focusStreak: user.focusStreak,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  });

  app.post("/login", async (request, reply) => {
    const result = loginSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const { email, password } = result.data;
    const user = await app.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await createTokenPair(app, { id: user.id, email: user.email });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        dailyGoalMinutes: user.dailyGoalMinutes,
        focusStreak: user.focusStreak,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  });

  app.post("/refresh", async (request, reply) => {
    const result = refreshSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const { refreshToken } = result.data;
    const tokenHash = hashToken(refreshToken);

    const storedToken = await app.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || dayjs().isAfter(storedToken.expiresAt) || storedToken.revokedAt) {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }

    const tokens = await createTokenPair(app, {
      id: storedToken.user.id,
      email: storedToken.user.email,
    });

    await app.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return reply.send({
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        dailyGoalMinutes: storedToken.user.dailyGoalMinutes,
        focusStreak: storedToken.user.focusStreak,
        createdAt: storedToken.user.createdAt,
      },
      ...tokens,
    });
  });

  app.post("/logout", async (request, reply) => {
    const result = refreshSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const { refreshToken } = result.data;
    const tokenHash = hashToken(refreshToken);

    await app.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return reply.send({ message: "Logged out" });
  });
}

