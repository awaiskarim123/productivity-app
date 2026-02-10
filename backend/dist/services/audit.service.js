"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
function getRequestMeta(request) {
    if (!request)
        return { ipAddress: null, userAgent: null };
    const ip = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        request.headers["x-real-ip"] ||
        request.ip ||
        null;
    const userAgent = request.headers["user-agent"] || null;
    return { ipAddress: ip ?? null, userAgent };
}
async function logAudit(prisma, userId, resource, resourceId, action, details, request) {
    const { ipAddress, userAgent } = getRequestMeta(request);
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                resource,
                resourceId,
                action,
                ...(details != null && Object.keys(details).length > 0 ? { details: details } : {}),
                ipAddress,
                userAgent,
            },
        });
    }
    catch (err) {
        console.error("[audit] logAudit failed", {
            userId,
            resource,
            resourceId,
            action,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
//# sourceMappingURL=audit.service.js.map