"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const env_1 = __importDefault(require("./config/env"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const auth_1 = __importDefault(require("./plugins/auth"));
const routes_1 = __importDefault(require("./routes"));
function getCorsOrigin(app) {
    if (env_1.default.CORS_ORIGIN === undefined || env_1.default.CORS_ORIGIN === "") {
        if (env_1.default.NODE_ENV === "production") {
            app.log.error("CORS_ORIGIN is not set in production; refusing to allow all origins. Set CORS_ORIGIN to your frontend origin(s).");
            return false;
        }
        return true;
    }
    const origins = env_1.default.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
    if (origins.length === 0) {
        app.log.warn("CORS_ORIGIN is empty or whitespace-only after parsing; denying all origins. Check env CORS_ORIGIN.");
        return false;
    }
    return origins.length === 1 ? origins[0] : origins;
}
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: env_1.default.NODE_ENV !== "test",
        trustProxy: true,
    });
    app.register(helmet_1.default, {
        contentSecurityPolicy: env_1.default.NODE_ENV === "production",
        crossOriginEmbedderPolicy: false,
    });
    app.register(cors_1.default, {
        origin: getCorsOrigin(app),
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    // Per-IP rate limiting (uses Fastify request.ip; trustProxy ensures correct client IP when behind a proxy)
    const rateLimitMax = env_1.default.NODE_ENV === "test" ? 10000 : env_1.default.RATE_LIMIT_MAX;
    const rateLimitWindowMs = env_1.default.NODE_ENV === "test" ? 60000 : env_1.default.RATE_LIMIT_WINDOW_MS;
    app.register(rate_limit_1.default, {
        max: rateLimitMax,
        timeWindow: rateLimitWindowMs,
    });
    app.register(prisma_1.default);
    app.register(auth_1.default);
    app.register(routes_1.default, { prefix: "/api" });
    return app;
}
//# sourceMappingURL=app.js.map