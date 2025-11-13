"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = __importDefault(require("./config/env"));
const app_1 = require("./app");
async function start() {
    const app = (0, app_1.buildApp)();
    try {
        await app.listen({ port: env_1.default.PORT, host: "0.0.0.0" });
        app.log.info(`Server listening on port ${env_1.default.PORT}`);
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}
void start();
//# sourceMappingURL=index.js.map