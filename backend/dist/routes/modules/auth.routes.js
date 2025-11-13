"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const ms_1 = __importDefault(require("ms"));
const env_1 = __importDefault(require("../../config/env"));
const auth_schema_1 = require("../../schemas/auth.schema");
const password_1 = require("../../utils/password");
const token_1 = require("../../utils/token");
async function createTokenPair(app, user) {
    const accessToken = await (0, token_1.createAccessToken)(app, user, env_1.default.JWT_ACCESS_TOKEN_TTL);
    const refreshToken = (0, token_1.generateRefreshToken)();
    const refreshTokenHash = (0, token_1.hashToken)(refreshToken);
    const expiresInMs = (0, ms_1.default)(env_1.default.JWT_REFRESH_TOKEN_TTL);
    if (!expiresInMs) {
        throw new Error("Invalid JWT_REFRESH_TOKEN_TTL value");
    }
    await app.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: (0, dayjs_1.default)().add(expiresInMs, "milliseconds").toDate(),
        },
    });
    return { accessToken, refreshToken };
}
async function authRoutes(app) {
    app.post("/register", async (request, reply) => {
        const result = auth_schema_1.registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { email, password, name, dailyGoalMinutes } = result.data;
        const existing = await app.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return reply.code(409).send({ message: "User already exists" });
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
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
        const result = auth_schema_1.loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { email, password } = result.data;
        const user = await app.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.code(401).send({ message: "Invalid credentials" });
        }
        const valid = await (0, password_1.verifyPassword)(password, user.passwordHash);
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
        const result = auth_schema_1.refreshSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { refreshToken } = result.data;
        const tokenHash = (0, token_1.hashToken)(refreshToken);
        const storedToken = await app.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken || (0, dayjs_1.default)().isAfter(storedToken.expiresAt) || storedToken.revokedAt) {
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
        const result = auth_schema_1.refreshSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { refreshToken } = result.data;
        const tokenHash = (0, token_1.hashToken)(refreshToken);
        await app.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return reply.send({ message: "Logged out" });
    });
}
//# sourceMappingURL=auth.routes.js.map