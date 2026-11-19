import { describe, expect, it } from "vitest";
import { generateSessionDates } from "./session-schedule";

describe("generateSessionDates", () => {
  it("repeats selected weekdays until the requested session count", () => {
    expect(generateSessionDates("2026-11-12", [1, 3], 4, 2)).toEqual([
      "2026-11-16",
      "2026-11-18",
      "2026-11-23",
      "2026-11-25",
    ]);
  });

  it("includes the start date when its weekday is selected", () => {
    expect(generateSessionDates("2026-11-12", [4], 1, 1)).toEqual([
      "2026-11-12",
    ]);
  });

  it("returns fewer dates when the duration cannot fit the requested count", () => {
    expect(generateSessionDates("2026-11-12", [1], 3, 1)).toEqual([
      "2026-11-16",
    ]);
  });

  it("returns no dates for invalid inputs or an empty weekday selection", () => {
    expect(generateSessionDates("2026-02-30", [1], 2, 2)).toEqual([]);
    expect(generateSessionDates("2026-11-12", [], 2, 2)).toEqual([]);
  });
});
