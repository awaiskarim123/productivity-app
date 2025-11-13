import type { FastifyInstance } from "fastify";
export declare function generateRefreshToken(): string;
export declare function hashToken(token: string): string;
export declare function createAccessToken(app: FastifyInstance, payload: {
    id: string;
    email: string;
}, expiresIn?: string): Promise<string>;
//# sourceMappingURL=token.d.ts.map