import type { FastifyReply } from "fastify";
import type * as z from "zod";
/** Parse with Zod; on failure send 400 and return undefined. */
export declare function parseOrBadRequest<T extends z.ZodType>(reply: FastifyReply, schema: T, value: unknown, message: string): z.infer<T> | undefined;
/** Validate `request.query` for a route; on failure send 400 with a standard query error shape. */
export declare function parseQueryOrBadRequest<T extends z.ZodType>(reply: FastifyReply, schema: T, query: unknown): z.infer<T> | undefined;
//# sourceMappingURL=parse-request.d.ts.map