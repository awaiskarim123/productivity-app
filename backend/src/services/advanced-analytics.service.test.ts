import { describe, it, expect } from "vitest";
import {
  buildFocusHeatmap,
  detectBurnout,
  computeProductivityScore,
  buildPeriodComparison,
} from "./advanced-analytics.service";

describe("advanced-analytics.service", () => {
  describe("buildFocusHeatmap", () => {
    it("returns a matrix of 7 days x 24 hours with minutes per cell", () => {
      const sessions = [
        { startedAt: new Date("2025-02-03T09:00:00Z"), durationMinutes: 25, mode: "FOCUS" as const },
        { startedAt: new Date("2025-02-03T09:30:00Z"), durationMinutes: 25, mode: "FOCUS" as const },
        { startedAt: new Date("2025-02-04T14:00:00Z"), durationMinutes: 45, mode: "FOCUS" as const },
      ];
      const result = buildFocusHeatmap(sessions, 7);
      expect(result.days).toHaveLength(7);
      expect(result.hours).toHaveLength(24);
      expect(result.cells).toBeDefined();
      const monday = result.days.indexOf("Mon");
      const hour9 = result.hours.indexOf(9);
      const hour14 = result.hours.indexOf(14);
      expect(monday).toBeGreaterThanOrEqual(0);
      expect(hour9).toBeGreaterThanOrEqual(0);
      expect(hour14).toBeGreaterThanOrEqual(0);
      const cell9Monday = result.cells.find(
        (c) => c.dayIndex === monday && c.hour === 9,
      );
      const cell14Tuesday = result.cells.find(
        (c) => c.dayIndex === result.days.indexOf("Tue") && c.hour === 14,
      );
      expect(cell9Monday?.minutes).toBe(50);
      expect(cell14Tuesday?.minutes).toBe(45);
    });

    it("ignores BREAK mode sessions for heatmap minutes", () => {
      const sessions = [
        { startedAt: new Date("2025-02-03T10:00:00Z"), durationMinutes: 5, mode: "BREAK" as const },
        { startedAt: new Date("2025-02-03T10:05:00Z"), durationMinutes: 25, mode: "FOCUS" as const },
      ];
      const result = buildFocusHeatmap(sessions, 7);
      const cell = result.cells.find(
        (c) => c.dayIndex === result.days.indexOf("Mon") && c.hour === 10,
      );
      expect(cell?.minutes).toBe(25);
    });
  });

  describe("detectBurnout", () => {
    it("flags burnout when many long sessions and low completion rate", () => {
      const sessions = [
        { durationMinutes: 90, completed: false, mode: "FOCUS" as const },
        { durationMinutes: 75, completed: false, mode: "FOCUS" as const },
        { durationMinutes: 60, completed: true, mode: "FOCUS" as const },
      ];
      const result = detectBurnout(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
      expect(result.atRisk).toBe(true);
      expect(result.longSessionsCount).toBe(3);
      expect(result.completionRate).toBeCloseTo(1 / 3);
    });

    it("does not flag when completion rate is high", () => {
      const sessions = [
        { durationMinutes: 90, completed: true, mode: "FOCUS" as const },
        { durationMinutes: 75, completed: true, mode: "FOCUS" as const },
      ];
      const result = detectBurnout(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
      expect(result.atRisk).toBe(false);
      expect(result.completionRate).toBe(1);
    });

    it("does not flag when no long sessions", () => {
      const sessions = [
        { durationMinutes: 25, completed: false, mode: "FOCUS" as const },
        { durationMinutes: 30, completed: false, mode: "FOCUS" as const },
      ];
      const result = detectBurnout(sessions, { longSessionMinutes: 60, lowCompletionThreshold: 0.5 });
      expect(result.atRisk).toBe(false);
      expect(result.longSessionsCount).toBe(0);
    });
  });

  describe("computeProductivityScore", () => {
    it("returns score 0-100 from focus time, completion, streak, and task completion", () => {
      const params = {
        focusMinutes: 300,
        dailyGoalMinutes: 300,
        focusCompletionRate: 0.8,
        streak: 5,
        taskCompletionRate: 0.7,
        workDaysInPeriod: 7,
      };
      const result = computeProductivityScore(params);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.focusTime).toBeDefined();
      expect(result.breakdown.completionRate).toBeDefined();
      expect(result.breakdown.consistency).toBeDefined();
      expect(result.breakdown.taskCompletion).toBeDefined();
    });

    it("gives higher score when meeting daily goal and high completion", () => {
      const high = computeProductivityScore({
        focusMinutes: 400,
        dailyGoalMinutes: 300,
        focusCompletionRate: 0.9,
        streak: 7,
        taskCompletionRate: 0.9,
        workDaysInPeriod: 7,
      });
      const low = computeProductivityScore({
        focusMinutes: 100,
        dailyGoalMinutes: 300,
        focusCompletionRate: 0.3,
        streak: 0,
        taskCompletionRate: 0.2,
        workDaysInPeriod: 7,
      });
      expect(high.score).toBeGreaterThan(low.score);
    });
  });

  describe("buildPeriodComparison", () => {
    it("returns this week, last week aggregates and deltas", () => {
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
      const result = buildPeriodComparison(thisWeek, lastWeek);
      expect(result.thisWeek).toEqual(thisWeek);
      expect(result.lastWeek).toEqual(lastWeek);
      expect(result.delta.focusMinutes).toBe(100);
      expect(result.delta.focusMinutesPercent).toBeCloseTo((100 / 300) * 100);
      expect(result.delta.completionRateChange).toBeDefined();
      expect(result.delta.taskCompletionChange).toBeDefined();
    });
  });
});
