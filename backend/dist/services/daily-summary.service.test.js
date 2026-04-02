"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const daily_summary_service_1 = require("./daily-summary.service");
(0, vitest_1.describe)("daily-summary.service", () => {
    (0, vitest_1.describe)("goalProgressPercent", () => {
        (0, vitest_1.it)("returns 0 when daily goal is 0 to avoid division by zero", () => {
            (0, vitest_1.expect)((0, daily_summary_service_1.goalProgressPercent)(30, 0)).toBe(0);
        });
        (0, vitest_1.it)("returns 100 when focus minutes meet or exceed goal", () => {
            (0, vitest_1.expect)((0, daily_summary_service_1.goalProgressPercent)(300, 300)).toBe(100);
            (0, vitest_1.expect)((0, daily_summary_service_1.goalProgressPercent)(400, 300)).toBe(100);
        });
        (0, vitest_1.it)("returns correct percentage when below goal", () => {
            (0, vitest_1.expect)((0, daily_summary_service_1.goalProgressPercent)(150, 300)).toBe(50);
            (0, vitest_1.expect)((0, daily_summary_service_1.goalProgressPercent)(75, 300)).toBe(25);
        });
    });
});
//# sourceMappingURL=daily-summary.service.test.js.map