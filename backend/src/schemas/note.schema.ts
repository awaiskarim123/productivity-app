import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10000),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPinned: z.boolean().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPinned: z.boolean().optional(),
});

export const notesQuerySchema = z.object({
  search: z.string().max(200).optional(),
  tag: z.string().max(50).optional(),
  isPinned: z.string().transform((val) => val === "true").optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

