"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productivityScoreQuerySchema = exports.burnoutQuerySchema = exports.heatmapQuerySchema = void 0;
const zod_1 = require("zod");
exports.heatmapQuerySchema = zod_1.z.object({
    days: zod_1.z.coerce.number().int().min(7).max(90).default(14),
});
exports.burnoutQuerySchema = zod_1.z.object({
    windowDays: zod_1.z.coerce.number().int().min(3).max(30).default(7),
});
exports.productivityScoreQuerySchema = zod_1.z.object({
    periodDays: zod_1.z.coerce.number().int().min(1).max(90).default(7),
});
//# sourceMappingURL=analytics.schema.js.map