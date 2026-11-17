import { describe, expect, it } from "vitest";
import { getEnrollmentAction } from "./enrollment";
import type { Activity } from "./types";

const baseActivity: Activity = {
  id: 1,
  name: "Actividad",
  description: "",
  date: "2026-12-01",
  startTime: "10:00",
  endTime: "12:00",
  capacity: 10,
  status: "ACTIVE",
  registrationDeadline: "2026-11-30T23:59:59",
  isCertifiable: false,
  minAttendancePercentage: 80,
  imageUrl: null,
  activityType: null,
  location: null,
  organizer: {
    id: 1,
    firstName: "Org",
    lastName: "Demo",
    email: "org@example.com",
    status: "ACTIVE",
  },
  createdAt: "2026-11-01T00:00:00.000Z",
  enrolledCount: 0,
  availableSpots: 10,
};

const now = new Date("2026-11-15T12:00:00");

describe("getEnrollmentAction", () => {
  it("offers enrollment when active, open, and with spots", () => {
    expect(getEnrollmentAction(baseActivity, false, now)).toEqual({
      kind: "enroll",
      label: "Inscribirse",
    });
  });

  it("shows that the student is already enrolled", () => {
    expect(getEnrollmentAction(baseActivity, true, now).kind).toBe("enrolled");
  });

  it("shows full when there are no spots", () => {
    expect(
      getEnrollmentAction(
        { ...baseActivity, availableSpots: 0 },
        false,
        now,
      ).kind,
    ).toBe("full");
  });

  it("shows finished even when spots are available", () => {
    expect(
      getEnrollmentAction(
        { ...baseActivity, status: "FINISHED" },
        false,
        now,
      ).kind,
    ).toBe("finished");
  });

  it("shows cancelled", () => {
    expect(
      getEnrollmentAction(
        { ...baseActivity, status: "CANCELLED" },
        false,
        now,
      ).kind,
    ).toBe("cancelled");
  });

  it("shows closed after the registration deadline", () => {
    expect(
      getEnrollmentAction(
        baseActivity,
        false,
        new Date("2026-12-01T00:00:00"),
      ).kind,
    ).toBe("deadline");
  });
});
