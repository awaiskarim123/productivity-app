"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const advanced_analytics_service_1 = require("./advanced-analytics.service");
(0, vitest_1.describe)("advanced-analytics.service", () => {
    (0, vitest_1.describe)("buildFocusHeatmap", () => {
        (0, vitest_1.it)("returns a matrix of 7 days x 24 hours with minutes per cell", () => {
            const sessions = [
                { startedAt: new Date("2025-02-03T09:00:00Z"), durationMinutes: 25, mode: "FOCUS" },
                { startedAt: new Date("2025-02-03T09:30:00Z"), durationMinutes: 25, mode: "FOCUS" },
                { startedAt: new Date("2025-02-04T14:00:00Z"), durationMinutes: 45, mode: "FOCUS" },
            ];
            const result = (0, advanced_analytics_service_1.buildFocusHeatmap)(sessions, 7);
            (0, vitest_1.expect)(result.days).toHaveLength(7);
            (0, vitest_1.expect)(result.hours).toHaveLength(24);
            (0, vitest_1.expect)(result.cells).toBeDefined();
            const monday = result.days.indexOf("Mon");
            const hour9 = result.hours.indexOf(9);
            const hour14 = result.hours.indexOf(14);
            (0, vitest_1.expect)(monday).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(hour9).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(hour14).toBeGreaterThanOrEqual(0);
            const cell9Monday = result.cells.find((c) => c.dayIndex === monday && c.hour === 9);
            const cell14Tuesday = result.cells.find((c) => c.dayIndex === result.days.indexOf("Tue") && c.hour === 14);
            (0, vitest_1.expect)(cell9Monday?.minutes).toBe(50);
            (0, vitest_1.expect)(cell14Tuesday?.minutes).toBe(45);
        });
        (0, vitest_1.it)("ignores BREAK mode sessions for heatmap minutes", () => {
            const sessions = [
                { startedAt: new Date("2025-02-03T10:00:00Z"), durationMinutes: 5, mode: "BREAK" },
                { startedAt: new Date("2025-02-03T10:05:00Z"), durationMinutes: 25, mode: "FOCUS" },
            ];
            const result = (0, advanced_analytics_service_1.buildFocusHeatmap)(sessions, 7);
            const cell = result.cells.find((c) => c.dayIndex === result.days.indexOf("Mon") && c.hour === 10);
            (0, vitest_1.expect)(cell?.minutes).toBe(25);
        });
    });
    (0, vitest_1.describe)("detectBurnout", () => {
        (0, vitest_1.it)("flags burnout when many long sessions and low completion rate", () => {
            const sessions = [
                { durationMinutes: 90, completed: false, mode: "FOCUS" },
                { durationMinutes: 75, completed: false, mode: "FOCUS" },
                { durationMinutes: 60, completed: true, mode: "FOCUS" },
            ];
            const result = (0, advanced_analytics_service_1.detectBurnout)(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
            (0, vitest_1.expect)(result.atRisk).toBe(true);
            (0, vitest_1.expect)(result.longSessionsCount).toBe(3);
            (0, vitest_1.expect)(result.completionRate).toBeCloseTo(1 / 3);
        });
        (0, vitest_1.it)("does not flag when completion rate is high", () => {
            const sessions = [
                { durationMinutes: 90, completed: true, mode: "FOCUS" },
                { durationMinutes: 75, completed: true, mode: "FOCUS" },
            ];
            const result = (0, advanced_analytics_service_1.detectBurnout)(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
            (0, vitest_1.expect)(result.atRisk).toBe(false);
            (0, vitest_1.expect)(result.completionRate).toBe(1);
        });
        (0, vitest_1.it)("does not flag when no long sessions", () => {
            const sessions = [
                { durationMinutes: 25, completed: false, mode: "FOCUS" },
                { durationMinutes: 30, completed: false, mode: "FOCUS" },
            ];
            const result = (0, advanced_analytics_service_1.detectBurnout)(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
            (0, vitest_1.expect)(result.atRisk).toBe(false);
            (0, vitest_1.expect)(result.longSessionsCount).toBe(0);
        });
    });
    (0, vitest_1.describe)("computeProductivityScore", () => {
        (0, vitest_1.it)("returns score 0-100 from focus time, completion, streak, and task completion", () => {
            const params = {
                focusMinutes: 300,
                dailyGoalMinutes: 300,
                focusCompletionRate: 0.8,
                streak: 5,
                taskCompletionRate: 0.7,
                workDaysInPeriod: 7,
            };
            const result = (0, advanced_analytics_service_1.computeProductivityScore)(params);
            (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(result.breakdown).toBeDefined();
            (0, vitest_1.expect)(result.breakdown.focusTime).toBeDefined();
            (0, vitest_1.expect)(result.breakdown.completionRate).toBeDefined();
            (0, vitest_1.expect)(result.breakdown.consistency).toBeDefined();
            (0, vitest_1.expect)(result.breakdown.taskCompletion).toBeDefined();
        });
        (0, vitest_1.it)("gives higher score when meeting daily goal and high completion", () => {
            const high = (0, advanced_analytics_service_1.computeProductivityScore)({
                focusMinutes: 400,
                dailyGoalMinutes: 300,
                focusCompletionRate: 0.9,
                streak: 7,
                taskCompletionRate: 0.9,
                workDaysInPeriod: 7,
            });
            const low = (0, advanced_analytics_service_1.computeProductivityScore)({
                focusMinutes: 100,
                dailyGoalMinutes: 300,
                focusCompletionRate: 0.3,
                streak: 0,
                taskCompletionRate: 0.2,
                workDaysInPeriod: 7,
            });
            (0, vitest_1.expect)(high.score).toBeGreaterThan(low.score);
        });
    });
    (0, vitest_1.describe)("buildPeriodComparison", () => {
        (0, vitest_1.it)("returns this week, last week aggregates and deltas", () => {
            const thisWeek = {
                focusMinutes: 400,
                completedSessions: 12,
                totalSessions: 15,
                taskCompleted: 8,
                taskTotal: 10,
            };
            const lastWeek = {
                focusMinutes: 300,
                completedSessions: 10,
                totalSessions: 14,
                taskCompleted: 6,
                taskTotal: 10,
            };
            const result = (0, advanced_analytics_service_1.buildPeriodComparison)(thisWeek, lastWeek);
            (0, vitest_1.expect)(result.thisWeek).toEqual(thisWeek);
            (0, vitest_1.expect)(result.lastWeek).toEqual(lastWeek);
            (0, vitest_1.expect)(result.delta.focusMinutes).toBe(100);
            (0, vitest_1.expect)(result.delta.focusMinutesPercent).toBeCloseTo((100 / 300) * 100);
            (0, vitest_1.expect)(result.delta.completionRateChange).toBeDefined();
            (0, vitest_1.expect)(result.delta.taskCompletionChange).toBeDefined();
        });
    });
});
//# sourceMappingURL=advanced-analytics.service.test.js.map