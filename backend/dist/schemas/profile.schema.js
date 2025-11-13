"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    dailyGoalMinutes: zod_1.z.coerce.number().int().min(30).max(1440).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});
//# sourceMappingURL=profile.schema.js.map