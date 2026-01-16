"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesQuerySchema = exports.updateNoteSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    content: zod_1.z.string().max(10000),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    isPinned: zod_1.z.boolean().optional(),
});
exports.updateNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    content: zod_1.z.string().max(10000).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    isPinned: zod_1.z.boolean().optional(),
});
exports.notesQuerySchema = zod_1.z.object({
    search: zod_1.z.string().max(200).optional(),
    tag: zod_1.z.string().max(50).optional(),
    isPinned: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? undefined : val === "true")),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
});
//# sourceMappingURL=note.schema.js.map