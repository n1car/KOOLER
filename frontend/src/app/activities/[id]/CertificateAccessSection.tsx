"use client";

import { Alert, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { formatPercent } from "@/lib/format";
import type { Eligibility } from "@/lib/types";

interface CertificateAccessSectionProps {
  enrolled: boolean;
  certifiable: boolean;
  loading: boolean;
  error: string;
  eligibility: Eligibility | null;
  certificateAvailable: boolean;
  downloading: boolean;
  downloadMessage: { tone: "success" | "error"; text: string } | null;
  onRetry: () => void;
  onDownload: () => void;
}

export function CertificateAccessSection({
  enrolled,
  certifiable,
  loading,
  error,
  eligibility,
  certificateAvailable,
  downloading,
  downloadMessage,
  onRetry,
  onDownload,
}: CertificateAccessSectionProps) {
  let content;

  if (!certifiable) {
    content = (
      <p className="text-sm leading-relaxed text-muted">
        Esta actividad no emite certificados de participación.
      </p>
    );
  } else if (!enrolled) {
    content = (
      <p className="text-sm leading-relaxed text-muted">
        Inscríbete en la actividad para consultar tu progreso y la
        disponibilidad de tu certificado.
      </p>
    );
  } else if (loading) {
    content = (
      <p className="animate-pulse text-sm text-muted">
        Consultando tu progreso y certificado...
      </p>
    );
  } else if (error) {
    content = (
      <div className="flex flex-col items-start gap-3">
        <Alert tone="danger">{error}</Alert>
        <Button variant="outline" onClick={onRetry}>
          Reintentar consulta
        </Button>
      </div>
    );
  } else if (!eligibility) {
    content = (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">
          Todavía no hay información de elegibilidad disponible.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Consultar elegibilidad
        </Button>
      </div>
    );
  } else if (eligibility.reason === "ACTIVITY_NOT_FINISHED") {
    content = (
      <Alert>
        El certificado estará disponible cuando finalice la actividad y se
        completen sus sesiones.
      </Alert>
    );
  } else if (eligibility.reason === "SESSIONS_PENDING") {
    content = (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-muted">
          {eligibility.sessionsPending === 1
            ? "Hay una sesión pendiente."
            : `Hay ${eligibility.sessionsPending} sesiones pendientes.`}{" "}
          La elegibilidad se confirmará cuando termine el desarrollo de todas
          las sesiones.
        </p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {eligibility.sessionsPresent}/{eligibility.sessionsTotal} sesiones
            asistidas
          </span>
          <span>{formatPercent(eligibility.attendancePercentage)}</span>
        </div>
        <ProgressBar value={eligibility.attendancePercentage} />
      </div>
    );
  } else if (eligibility.reason === "BELOW_MINIMUM") {
    content = (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-muted">
          Tu asistencia actual es{" "}
          <strong className="text-foreground">
            {formatPercent(eligibility.attendancePercentage)}
          </strong>
          . Necesitas alcanzar al menos{" "}
          <strong className="text-foreground">
            {eligibility.minimumAttendancePercentage}%
          </strong>{" "}
          para obtener el certificado.
        </p>
        <ProgressBar value={eligibility.attendancePercentage} />
      </div>
    );
  } else if (eligibility.reason === "NO_SESSIONS") {
    content = (
      <Alert>
        Aún no hay sesiones finalizadas para calcular la asistencia requerida.
      </Alert>
    );
  } else if (eligibility.reason === "ACTIVITY_NOT_CERTIFIABLE") {
    content = (
      <Alert>Esta actividad no emite certificados de participación.</Alert>
    );
  } else if (certificateAvailable) {
    content = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[#145B48]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDF3E9]">
            <CertificateIcon width={16} height={16} />
          </span>
          Cumples los requisitos de asistencia.
        </div>
        <Button
          className="w-full sm:w-auto"
          loading={downloading}
          onClick={onDownload}
        >
          <CertificateIcon width={18} height={18} />
          Descargar certificado PDF
        </Button>
      </div>
    );
  } else if (eligibility.eligible) {
    content = (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm leading-relaxed text-muted">
          Cumples el requisito de asistencia. El certificado se está
          preparando; vuelve a consultar en un momento.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Revisar disponibilidad
        </Button>
      </div>
    );
  } else {
    content = (
      <Alert>
        Aún no se puede confirmar tu elegibilidad para este certificado.
      </Alert>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-[#D7E2EA] bg-[linear-gradient(135deg,#F7FAFC_0%,#FFFFFF_62%,#FBF6EA_100%)] p-5">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full border border-[#D9C79F]/50"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0F6] text-primary">
            <CertificateIcon width={21} height={21} />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Certificado de participación
              </h2>
              {eligibility?.eligible && certificateAvailable && (
                <Badge tone="success">Disponible</Badge>
              )}
            </div>
            <p className="text-xs text-muted">
              Requisito mínimo de asistencia:{" "}
              {eligibility?.minimumAttendancePercentage ?? 80}%
            </p>
          </div>
        </div>
        <div className="relative">{content}</div>
        {downloadMessage && (
          <Alert tone={downloadMessage.tone === "success" ? "success" : "danger"}>
            {downloadMessage.text}
          </Alert>
        )}
      </div>
    </Card>
  );
}
