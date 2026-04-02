"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrBadRequest = parseOrBadRequest;
/** Parse with Zod; on failure send 400 and return undefined. */
function parseOrBadRequest(reply, schema, value, message) {
    const result = schema.safeParse(value);
    if (!result.success) {
        reply.code(400).send({ message, errors: result.error.flatten() });
        return undefined;
    }
    return result.data;
}
//# sourceMappingURL=parse-request.js.map