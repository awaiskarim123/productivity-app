import type { FastifyRequest } from "fastify";
import type { PrismaClient } from "../generated/prisma/client";
export type AuditResource = "task" | "habit" | "note" | "work_session" | "focus_session";
export type AuditAction = "create" | "update" | "delete";
export interface AuditDetails {
    [key: string]: unknown;
}
export declare function logAudit(prisma: PrismaClient, userId: string, resource: AuditResource, resourceId: string, action: AuditAction, details?: AuditDetails, request?: FastifyRequest): Promise<void>;
//# sourceMappingURL=audit.service.d.ts.map