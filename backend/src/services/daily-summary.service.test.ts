import { describe, it, expect } from "vitest";
import { goalProgressPercent } from "./daily-summary.service";

describe("daily-summary.service", () => {
  describe("goalProgressPercent", () => {
    it("returns 0 when daily goal is 0 to avoid division by zero", () => {
      expect(goalProgressPercent(30, 0)).toBe(0);
    });

    it("returns 100 when focus minutes meet or exceed goal", () => {
      expect(goalProgressPercent(300, 300)).toBe(100);
      expect(goalProgressPercent(400, 300)).toBe(100);
    });

    it("returns correct percentage when below goal", () => {
      expect(goalProgressPercent(150, 300)).toBe(50);
      expect(goalProgressPercent(75, 300)).toBe(25);
    });
  });
});
