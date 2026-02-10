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
const task_routes_1 = __importDefault(require("./modules/task.routes"));
const habit_routes_1 = __importDefault(require("./modules/habit.routes"));
const note_routes_1 = __importDefault(require("./modules/note.routes"));
const goal_routes_1 = __importDefault(require("./modules/goal.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit.routes"));
async function registerRoutes(app) {
    app.get("/health", async () => ({ status: "ok" }));
    app.register(auth_routes_1.default, { prefix: "/auth" });
    app.register(profile_routes_1.default, { prefix: "/profile" });
    app.register(work_routes_1.default, { prefix: "/work" });
    app.register(focus_routes_1.default, { prefix: "/focus" });
    app.register(analytics_routes_1.default, { prefix: "/analytics" });
    app.register(motivation_routes_1.default, { prefix: "/motivation" });
    app.register(task_routes_1.default, { prefix: "/tasks" });
    app.register(habit_routes_1.default, { prefix: "/habits" });
    app.register(note_routes_1.default, { prefix: "/notes" });
    app.register(goal_routes_1.default, { prefix: "/goals" });
    app.register(audit_routes_1.default, { prefix: "/audit-logs" });
}
//# sourceMappingURL=index.js.map