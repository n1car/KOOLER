"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RateActivityModal } from "@/components/RateActivityModal";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Stars,
} from "@/components/ui";
import { CertificateIcon, HistoryIcon } from "@/components/icons";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Certificate, HistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [toRate, setToRate] = useState<HistoryItem | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [certificatesError, setCertificatesError] = useState("");
  const [downloadingCertificateId, setDownloadingCertificateId] = useState<number | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{
    certificateId: number;
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const downloadLock = useRef(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setItems(await api.history.list());
    } catch (err) {
      setHistoryError(
        err instanceof ApiError ? err.message : "No se pudo cargar tu historial.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadCertificates = useCallback(async () => {
    setCertificatesLoading(true);
    setCertificatesError("");
    try {
      setCertificates(await api.certificates.list());
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCertificates([]);
      } else {
        setCertificatesError(
          err instanceof ApiError ? err.message : "No se pudieron cargar tus certificados.",
        );
      }
    } finally {
      setCertificatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
    void loadCertificates();
  }, [loadHistory, loadCertificates]);

  async function downloadCertificate(certificateId: number) {
    if (downloadLock.current) return;
    downloadLock.current = true;
    setDownloadingCertificateId(certificateId);
    setDownloadMessage(null);
    try {
      await api.certificates.download(certificateId);
      setDownloadMessage({
        certificateId,
        tone: "success",
        text: "La descarga del certificado comenzó.",
      });
    } catch (err) {
      setDownloadMessage({
        certificateId,
        tone: "error",
        text: err instanceof ApiError ? err.message : "No se pudo descargar el certificado.",
      });
    } finally {
      downloadLock.current = false;
      setDownloadingCertificateId(null);
    }
  }

  async function submitReview(stars: number, comment: string) {
    if (!toRate) return;
    try {
      await api.reviews.create({
        activityId: toRate.activityId,
        rating: stars,
        comment: comment || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        throw new Error("Ya calificaste esta actividad.");
      }
      throw new Error(err instanceof ApiError ? err.message : "No pudimos guardar tu calificación.");
    }
    const activityId = toRate.activityId;
    setItems((prev) =>
      prev.map((i) =>
        i.activityId === activityId ? { ...i, reviewed: true, myRating: stars } : i,
      ),
    );
    setReviewMessage("¡Gracias! Tu calificación quedó registrada.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#242633]">Mi historial</h2>
          <p className="text-xs text-muted">Actividades en las que participaste</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {items.length} {items.length === 1 ? "Finalizada" : "Finalizadas"}
        </span>
      </div>

      <section className="order-2 flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">Mis certificados</h3>
        {certificatesLoading ? (
          <LoadingState label="Cargando certificados..." />
        ) : certificatesError ? (
          <ErrorState message={certificatesError} onRetry={() => void loadCertificates()} />
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<CertificateIcon width={32} height={32} />}
            title="Aún no tienes certificados"
            description="Cuando se emita un certificado para ti, podrás descargarlo aquí."
          />
        ) : (
          certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col gap-3">
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3 md:flex-1">
                  <CertificateIcon width={22} height={22} className="shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Certificado de actividad #{certificate.activityId}
                    </h4>
                    <p className="text-xs text-muted">
                      Emitido el {formatDateTime(certificate.issueDate)}
                    </p>
                    <p className="break-all text-xs text-muted">
                      Código: {certificate.certificateCode}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  className="w-full md:w-auto md:shrink-0"
                  loading={downloadingCertificateId === certificate.id}
                  disabled={downloadingCertificateId !== null}
                  onClick={() => void downloadCertificate(certificate.id)}
                >
                  <CertificateIcon width={18} height={18} />
                  Ver certificado
                </Button>
              </div>
              {downloadMessage?.certificateId === certificate.id && (
                <Alert tone={downloadMessage.tone === "success" ? "success" : "danger"}>
                  {downloadMessage.text}
                </Alert>
              )}
            </Card>
          ))
        )}
      </section>

      <section className="order-1 flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">Mis actividades finalizadas</h3>

        {reviewMessage && <Alert tone="success">{reviewMessage}</Alert>}

        {historyLoading ? (
          <LoadingState label="Cargando historial..." />
        ) : historyError ? (
          <ErrorState message={historyError} onRetry={() => void loadHistory()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon width={36} height={36} />}
            title="Sin actividades finalizadas"
            description="Aquí verás las actividades que ya completaste."
          />
        ) : (
          items.map((item) => (
            <Card key={item.activityId} className="flex flex-col gap-3 rounded-3xl border-0 border-t-4 border-t-primary shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted">{formatDate(item.date)}</p>
                </div>
                {item.attendance === "PRESENT" ? (
                  <Badge tone="success">Asististe</Badge>
                ) : (
                  <Badge tone="danger">No asististe</Badge>
                )}
              </div>

              {item.reviewed ? (
                <div className="flex flex-col gap-1">
                  <Stars value={item.myRating ?? 0} readOnly size={20} />
                  <p className="text-xs text-muted">Ya calificaste esta actividad.</p>
                </div>
              ) : item.attendance === "PRESENT" ? (
                <Button variant="outline" fullWidth onClick={() => setToRate(item)}>
                  Calificar actividad
                </Button>
              ) : (
                <p className="text-xs text-muted">
                  Solo puedes calificar actividades en las que asististe.
                </p>
              )}
            </Card>
          ))
        )}
      </section>

      <RateActivityModal
        open={toRate !== null}
        activityName={toRate?.name ?? ""}
        onClose={() => setToRate(null)}
        onSubmit={submitReview}
      />
    </div>
  );
}
