import { describe, expect, it } from "vitest";
import { canRecordAttendance, hasSessionEndElapsed } from "./session-time";

describe("session attendance availability", () => {
  it("opens exactly when a session end time passes in Colombia", () => {
    expect(
      hasSessionEndElapsed(
        "2026-11-12",
        "05:00",
        new Date("2026-11-12T09:59:59.999Z"),
      ),
    ).toBe(false);
    expect(
      hasSessionEndElapsed(
        "2026-11-12",
        "05:00",
        new Date("2026-11-12T10:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("allows ended sessions during an active activity but blocks future sessions", () => {
    const now = new Date("2026-11-12T10:00:00.000Z");
    expect(
      canRecordAttendance(
        "ACTIVE",
        { sessionDate: "2026-11-12", endTime: "05:00" },
        now,
      ),
    ).toBe(true);
    expect(
      canRecordAttendance(
        "ACTIVE",
        { sessionDate: "2026-11-13", endTime: "05:00" },
        now,
      ),
    ).toBe(false);
  });

  it("does not allow recording for cancelled activities or invalid session times", () => {
    const now = new Date("2026-11-12T10:00:00.000Z");
    expect(
      canRecordAttendance(
        "CANCELLED",
        { sessionDate: "2026-11-12", endTime: "05:00" },
        now,
      ),
    ).toBe(false);
    expect(hasSessionEndElapsed("2026-02-30", "05:00", now)).toBe(false);
    expect(hasSessionEndElapsed("2026-11-12", null, now)).toBe(false);
  });
});
