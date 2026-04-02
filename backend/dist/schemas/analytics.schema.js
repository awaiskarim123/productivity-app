"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyInsightsQuerySchema = exports.productivityScoreQuerySchema = exports.burnoutQuerySchema = exports.heatmapQuerySchema = void 0;
const zod_1 = require("zod");
function isValidYyyyMmDdUtc(s) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!match?.[1] || !match[2] || !match[3])
        return false;
    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}
exports.heatmapQuerySchema = zod_1.z.object({
    days: zod_1.z.coerce.number().int().min(7).max(90).default(14),
});
exports.burnoutQuerySchema = zod_1.z.object({
    windowDays: zod_1.z.coerce.number().int().min(3).max(30).default(7),
});
exports.productivityScoreQuerySchema = zod_1.z.object({
    periodDays: zod_1.z.coerce.number().int().min(1).max(90).default(7),
});
/** Optional weekStart (date string YYYY-MM-DD) to fetch insights for a specific week (e.g. last week). */
exports.weeklyInsightsQuerySchema = zod_1.z
    .object({
    weekStart: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
    .refine((data) => !data.weekStart || isValidYyyyMmDdUtc(data.weekStart), {
    message: "weekStart must be a valid calendar date",
    path: ["weekStart"],
});
//# sourceMappingURL=analytics.schema.js.map