import type { FastifyReply } from "fastify";
import type * as z from "zod";

/** Parse with Zod; on failure send 400 and return undefined. */
export function parseOrBadRequest<T extends z.ZodType>(
  reply: FastifyReply,
  schema: T,
  value: unknown,
  message: string,
): z.infer<T> | undefined {
  const result = schema.safeParse(value);
  if (!result.success) {
    reply.code(400).send({ message, errors: result.error.flatten() });
    return undefined;
  }
  return result.data;
}

/** Validate `request.query` for a route; on failure send 400 with a standard query error shape. */
export function parseQueryOrBadRequest<T extends z.ZodType>(
  reply: FastifyReply,
  schema: T,
  query: unknown,
): z.infer<T> | undefined {
  return parseOrBadRequest(reply, schema, query ?? {}, "Invalid query");
}
