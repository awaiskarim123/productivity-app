declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: string;
            email: string;
        };
    }
}
declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>) => Promise<void>;
export default _default;
//# sourceMappingURL=auth.d.ts.map