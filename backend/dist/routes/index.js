"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const auth_routes_1 = __importDefault(require("./modules/auth.routes"));
const profile_routes_1 = __importDefault(require("./modules/profile.routes"));
const work_routes_1 = __importDefault(require("./modules/work.routes"));
const focus_routes_1 = __importDefault(require("./modules/focus.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics.routes"));
const motivation_routes_1 = __importDefault(require("./modules/motivation.routes"));
async function registerRoutes(app) {
    app.get("/health", async () => ({ status: "ok" }));
    app.register(auth_routes_1.default, { prefix: "/auth" });
    app.register(profile_routes_1.default, { prefix: "/profile" });
    app.register(work_routes_1.default, { prefix: "/work" });
    app.register(focus_routes_1.default, { prefix: "/focus" });
    app.register(analytics_routes_1.default, { prefix: "/analytics" });
    app.register(motivation_routes_1.default, { prefix: "/motivation" });
}
//# sourceMappingURL=index.js.map