"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = generateRefreshToken;
exports.hashToken = hashToken;
exports.createAccessToken = createAccessToken;
const node_crypto_1 = __importDefault(require("node:crypto"));
function generateRefreshToken() {
    return node_crypto_1.default.randomBytes(48).toString("hex");
}
function hashToken(token) {
    return node_crypto_1.default.createHash("sha256").update(token).digest("hex");
}
async function createAccessToken(app, payload, expiresIn) {
    const options = expiresIn ? { expiresIn } : undefined;
    return app.jwt.sign(payload, options);
}
//# sourceMappingURL=token.js.map