import { z } from "zod";
export declare const createNoteSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateNoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const notesQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    isPinned: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=note.schema.d.ts.map