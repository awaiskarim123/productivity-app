import type { FastifyRequest } from "fastify";
import type { PrismaClient } from "../generated/prisma/client";

export type AuditResource = "task" | "habit" | "note" | "work_session" | "focus_session";
export type AuditAction = "create" | "update" | "delete";

export interface AuditDetails {
  [key: string]: unknown;
}

function getRequestMeta(request?: FastifyRequest): { ipAddress: string | null; userAgent: string | null } {
  if (!request) return { ipAddress: null, userAgent: null };
  const ip =
    (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (request.headers["x-real-ip"] as string) ||
    request.ip ||
    null;
  const userAgent = (request.headers["user-agent"] as string) || null;
  return { ipAddress: ip ?? null, userAgent };
}

export async function logAudit(
  prisma: PrismaClient,
  userId: string,
  resource: AuditResource,
  resourceId: string,
  action: AuditAction,
  details?: AuditDetails,
  request?: FastifyRequest
): Promise<void> {
  const { ipAddress, userAgent } = getRequestMeta(request);
  await prisma.auditLog.create({
    data: {
      userId,
      resource,
      resourceId,
      action,
      ...(details != null && Object.keys(details).length > 0 ? { details: details as object } : {}),
      ipAddress,
      userAgent,
    },
  });
}
