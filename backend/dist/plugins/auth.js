"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const env_1 = __importDefault(require("../config/env"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.register(jwt_1.default, {
        secret: env_1.default.JWT_SECRET,
        sign: {
            expiresIn: env_1.default.JWT_ACCESS_TOKEN_TTL,
        },
    });
    fastify.decorate("authenticate", async function authenticate(request, reply) {
        try {
            await request.jwtVerify();
        }
        catch (error) {
            reply.code(401).send({ message: "Unauthorized" });
        }
    });
});
//# sourceMappingURL=auth.js.map