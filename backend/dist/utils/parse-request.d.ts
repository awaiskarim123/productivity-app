import type { FastifyReply } from "fastify";
import type * as z from "zod";
/** Parse with Zod; on failure send 400 and return undefined. */
export declare function parseOrBadRequest<T extends z.ZodType>(reply: FastifyReply, schema: T, value: unknown, message: string): z.infer<T> | undefined;
//# sourceMappingURL=parse-request.d.ts.map