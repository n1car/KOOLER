import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CertificateAccessSection } from "./CertificateAccessSection";
import type { Eligibility } from "@/lib/types";

afterEach(cleanup);

function renderSection(
  eligibility: Eligibility | null,
  overrides: Partial<ComponentProps<typeof CertificateAccessSection>> = {},
) {
  return render(
    <CertificateAccessSection
      enrolled
      certifiable
      loading={false}
      error=""
      eligibility={eligibility}
      certificateAvailable={false}
      downloading={false}
      downloadMessage={null}
      onRetry={vi.fn()}
      onDownload={vi.fn()}
      {...overrides}
    />,
  );
}

const createEligibility = (
  overrides: Partial<Eligibility> = {},
): Eligibility => ({
  activityId: 7,
  sessionsTotal: 5,
  sessionsPresent: 3,
  attendancePercentage: 60,
  minimumAttendancePercentage: 80,
  sessionsPending: 0,
  eligible: false,
  ...overrides,
});

describe("CertificateAccessSection", () => {
  it("explains that the certificate is unavailable until the activity ends", () => {
    renderSection(
      createEligibility({ reason: "ACTIVITY_NOT_FINISHED" }),
    );

    expect(
      screen.getByText(/estará disponible cuando finalice la actividad/i),
    ).toBeTruthy();
  });

  it("shows current attendance and the required minimum", () => {
    renderSection(createEligibility({ reason: "BELOW_MINIMUM" }));

    expect(screen.getByText(/60%/)).toBeTruthy();
    expect(screen.getByText(/Tu asistencia actual es/i).textContent).toContain(
      "80%",
    );
  });

  it("explains when sessions remain pending", () => {
    renderSection(
      createEligibility({
        reason: "SESSIONS_PENDING",
        sessionsPending: 2,
      }),
    );

    expect(screen.getByText(/Hay 2 sesiones pendientes/i)).toBeTruthy();
  });

  it("offers download when eligibility and certificate are available", () => {
    const onDownload = vi.fn();
    renderSection(
      createEligibility({
        eligible: true,
        attendancePercentage: 80,
      }),
      { certificateAvailable: true, onDownload },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Descargar certificado PDF/i }),
    );

    expect(onDownload).toHaveBeenCalledOnce();
  });

  it("shows loading, errors, and missing enrollment without requesting private eligibility", () => {
    const { rerender } = renderSection(null, { enrolled: false });
    expect(
      screen.getByText(/Inscríbete en la actividad/i),
    ).toBeTruthy();

    rerender(
      <CertificateAccessSection
        enrolled
        certifiable
        loading
        error=""
        eligibility={null}
        certificateAvailable={false}
        downloading={false}
        downloadMessage={null}
        onRetry={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText(/Consultando tu progreso/i)).toBeTruthy();

    rerender(
      <CertificateAccessSection
        enrolled
        certifiable
        loading={false}
        error="No se pudo consultar la elegibilidad."
        eligibility={null}
        certificateAvailable={false}
        downloading={false}
        downloadMessage={null}
        onRetry={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText(/No se pudo consultar la elegibilidad/i)).toBeTruthy();
  });
});
