"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Stars,
  Textarea,
} from "@/components/ui";
import { CertificateIcon, HistoryIcon } from "@/components/icons";
import { formatDate, formatDateTime } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import { mockHistory } from "@/lib/mock";
import type { Certificate, HistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>(mockHistory);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [certificatesError, setCertificatesError] = useState("");
  const [downloadingCertificateId, setDownloadingCertificateId] = useState<
    number | null
  >(null);
  const [downloadMessage, setDownloadMessage] = useState<{
    certificateId: number;
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const downloadLock = useRef(false);
  const [drafts, setDrafts] = useState<
    Record<number, { rating: number; comment: string }>
  >(() =>
    Object.fromEntries(
      mockHistory.map((item) => [
        item.activityId,
        { rating: item.myRating ?? 0, comment: "" },
      ]),
    ),
  );

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
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar tus certificados.",
        );
      }
    } finally {
      setCertificatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

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
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo descargar el certificado.",
      });
    } finally {
      downloadLock.current = false;
      setDownloadingCertificateId(null);
    }
  }

  function submitReview(activityId: number) {
    const draft = drafts[activityId];
    if (!draft || draft.rating < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.activityId === activityId
          ? { ...item, reviewed: true, myRating: draft.rating }
          : item,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Historial y valoraciones</h2>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">Mis certificados</h3>
        {certificatesLoading ? (
          <LoadingState label="Cargando certificados..." />
        ) : certificatesError ? (
          <ErrorState
            message={certificatesError}
            onRetry={() => void loadCertificates()}
          />
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<CertificateIcon width={32} height={32} />}
            title="Aún no tienes certificados"
            description="Cuando se emita un certificado para ti, podrás descargarlo aquí."
          />
        ) : (
          certificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CertificateIcon
                    width={22}
                    height={22}
                    className="shrink-0 text-primary"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Certificado de actividad #{certificate.activityId}
                    </h4>
                    <p className="text-xs text-muted">
                      Emitido el {formatDateTime(certificate.issueDate)}
                    </p>
                    <p className="text-xs text-muted">
                      Código: {certificate.certificateCode}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  className="sm:w-auto"
                  loading={downloadingCertificateId === certificate.id}
                  disabled={downloadingCertificateId !== null}
                  onClick={() => void downloadCertificate(certificate.id)}
                >
                  <CertificateIcon width={18} height={18} />
                  Ver certificado
                </Button>
              </div>
              {downloadMessage?.certificateId === certificate.id && (
                <Alert
                  tone={
                    downloadMessage.tone === "success" ? "success" : "danger"
                  }
                >
                  {downloadMessage.text}
                </Alert>
              )}
            </Card>
          ))
        )}
      </section>

      {items.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon width={36} height={36} />}
          title="Sin actividades finalizadas"
          description="Aquí verás las actividades certificadas que ya completaste."
        />
      ) : (
        items.map((item) => {
          const draft = drafts[item.activityId] ?? { rating: 0, comment: "" };
          return (
            <Card key={item.activityId} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted">{formatDate(item.date)}</p>
                </div>
                {item.attendance === "PRESENT" && (
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    Asististe
                  </span>
                )}
              </div>

              {item.reviewed ? (
                <div className="flex flex-col gap-1">
                  <Stars value={item.myRating ?? 0} readOnly size={20} />
                  <p className="text-xs text-muted">
                    Ya calificaste esta actividad.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Stars
                    value={draft.rating}
                    onChange={(rating) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.activityId]: { ...draft, rating },
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Deja un comentario público (opcional)"
                    maxLength={500}
                    value={draft.comment}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.activityId]: {
                          ...draft,
                          comment: e.target.value,
                        },
                      }))
                    }
                  />
                  <Button fullWidth onClick={() => submitReview(item.activityId)}>
                    Calificar actividad
                  </Button>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
