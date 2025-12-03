import type { FastifyInstance } from "fastify";
import {
  createNoteSchema,
  updateNoteSchema,
  notesQuerySchema,
} from "../../schemas/note.schema";

export default async function noteRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.post("/", async (request, reply) => {
    const result = createNoteSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const note = await app.prisma.note.create({
      data: {
        userId: request.user.id,
        title: result.data.title,
        content: result.data.content,
        tags: result.data.tags ?? [],
        isPinned: result.data.isPinned ?? false,
      },
    });

    return reply.code(201).send({ note });
  });

  app.get("/", async (request, reply) => {
    const result = notesQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const { search, tag, isPinned, limit, offset } = result.data;
    const where: any = {
      userId: request.user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (isPinned !== undefined) {
      where.isPinned = isPinned;
    }

    const [notes, total] = await Promise.all([
      app.prisma.note.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          { updatedAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      app.prisma.note.count({ where }),
    ]);

    return { notes, total, limit, offset };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const note = await app.prisma.note.findFirst({
      where: {
        id,
        userId: request.user.id,
      },
    });

    if (!note) {
      return reply.code(404).send({ message: "Note not found" });
    }

    return { note };
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateNoteSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const existingNote = await app.prisma.note.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existingNote) {
      return reply.code(404).send({ message: "Note not found" });
    }

    const updateData: any = {};
    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.content !== undefined) updateData.content = result.data.content;
    if (result.data.tags !== undefined) updateData.tags = result.data.tags;
    if (result.data.isPinned !== undefined) updateData.isPinned = result.data.isPinned;

    const note = await app.prisma.note.update({
      where: { id },
      data: updateData,
    });

    return { note };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const note = await app.prisma.note.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!note) {
      return reply.code(404).send({ message: "Note not found" });
    }

    await app.prisma.note.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.get("/tags/all", async (request) => {
    const notes = await app.prisma.note.findMany({
      where: { userId: request.user.id },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });

    return { tags: Array.from(tagSet).sort() };
  });
}

