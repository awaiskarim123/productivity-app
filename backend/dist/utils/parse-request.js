"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrBadRequest = parseOrBadRequest;
exports.parseQueryOrBadRequest = parseQueryOrBadRequest;
/** Parse with Zod; on failure send 400 and return undefined. */
function parseOrBadRequest(reply, schema, value, message) {
    const result = schema.safeParse(value);
    if (!result.success) {
        reply.code(400).send({ message, errors: result.error.flatten() });
        return undefined;
    }
    return result.data;
}
/** Validate `request.query` for a route; on failure send 400 with a standard query error shape. */
function parseQueryOrBadRequest(reply, schema, query) {
    return parseOrBadRequest(reply, schema, query ?? {}, "Invalid query");
}
//# sourceMappingURL=parse-request.js.map