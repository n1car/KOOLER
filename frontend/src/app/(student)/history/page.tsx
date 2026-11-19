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
import {
  CalendarIcon,
  CertificateIcon,
  HistoryIcon,
  MapPinIcon,
} from "@/components/icons";
import { CategoryStripe } from "@/components/CategoryStripe";
import { ActivityCategoryIcon } from "@/components/ActivityCategoryIcon";
import { activityTypeColor } from "@/lib/category";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Certificate, HistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [activityMetadata, setActivityMetadata] = useState<
    Map<
      number,
      {
        category: string | null;
        location: string | null;
        isCertifiable: boolean;
      }
    >
  >(new Map());
  const [activityMetadataError, setActivityMetadataError] = useState("");
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
    setActivityMetadataError("");
    try {
      const [historyResult, enrollmentsResult] = await Promise.allSettled([
        api.history.list(),
        api.activities.myEnrollments(),
      ]);
      if (historyResult.status === "rejected") throw historyResult.reason;

      setItems(historyResult.value);
      if (enrollmentsResult.status === "fulfilled") {
        setActivityMetadata(
          new Map(
            enrollmentsResult.value.map(({ activity }) => [
              activity.id,
              {
                category: activity.category,
                location: activity.location,
                isCertifiable: activity.isCertifiable,
              },
            ]),
          ),
        );
      } else {
        setActivityMetadata(new Map());
        setActivityMetadataError(
          enrollmentsResult.reason instanceof ApiError
            ? enrollmentsResult.reason.message
            : "No se pudieron cargar las categorías y ubicaciones.",
        );
      }
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

  const visibleCertificates = certificates.filter(
    (certificate) =>
      activityMetadata.get(certificate.activityId)?.isCertifiable === true,
  );
  const certificatesByActivityId = new Map(
    visibleCertificates.map((certificate) => [
      certificate.activityId,
      certificate,
    ]),
  );
  const historyActivityIds = new Set(items.map((item) => item.activityId));
  const unlinkedCertificates = visibleCertificates.filter(
    (certificate) => !historyActivityIds.has(certificate.activityId),
  );
  const showCertificateSection =
    certificatesLoading ||
    certificatesError !== "" ||
    unlinkedCertificates.length > 0 ||
    items.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#242633]">Mi historial</h2>
          <p className="text-xs text-muted">Actividades en las que participaste</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {items.length} {items.length === 1 ? "Finalizada" : "Finalizadas"}
        </span>
      </div>

      {activityMetadataError && (
        <Alert tone="info">
          No se pudieron cargar algunos datos de categoría y ubicación.{" "}
          {activityMetadataError}
        </Alert>
      )}

      <section className="flex flex-col gap-3">
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
          items.map((item) => {
            const metadata = activityMetadata.get(item.activityId);
            const accent = metadata?.category
              ? activityTypeColor(metadata.category)
              : "#CBD5E1";
            const certificate = certificatesByActivityId.get(item.activityId);

            return (
              <article
                key={item.activityId}
                className="overflow-hidden rounded-2xl bg-white"
              >
                <CategoryStripe color={accent} />
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {metadata?.category && (
                        <>
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: `${accent}1A`,
                              color: accent,
                            }}
                          >
                            <ActivityCategoryIcon
                              category={metadata.category}
                              size={18}
                            />
                          </span>
                          <span
                            className="truncate rounded-full px-2.5 py-1 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${accent}1A`,
                              color: accent,
                            }}
                          >
                            {metadata.category}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone="muted">Finalizada</Badge>
                      <span
                        className={`text-[11px] font-medium ${
                          item.attendance === "PRESENT"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {item.attendance === "PRESENT"
                          ? "Asististe"
                          : "No asististe"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[15px] font-bold leading-snug text-foreground">
                      {item.name}
                    </h4>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon width={14} height={14} />
                        {formatDate(item.date)}
                      </span>
                      {metadata?.location && (
                        <span className="inline-flex min-w-0 items-center gap-1 break-words">
                          <MapPinIcon
                            width={14}
                            height={14}
                            className="shrink-0"
                          />
                          {metadata.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars
                      value={item.reviewed ? (item.myRating ?? 0) : 0}
                      readOnly
                      size={17}
                    />
                    <span className="text-xs text-muted">
                      {item.reviewed
                        ? item.myRating === null
                          ? "Enviado"
                          : `${item.myRating}/5 · Enviado`
                        : item.attendance === "PRESENT"
                          ? "Pendiente de calificar"
                          : "No puedes calificar esta actividad"}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {!item.reviewed && item.attendance === "PRESENT" && (
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setToRate(item)}
                      >
                        Calificar actividad
                      </Button>
                    )}
                    {certificate && (
                      <Button
                        variant="outline"
                        fullWidth
                        loading={downloadingCertificateId === certificate.id}
                        disabled={downloadingCertificateId !== null}
                        onClick={() => void downloadCertificate(certificate.id)}
                      >
                        <CertificateIcon width={18} height={18} />
                        Ver certificado
                      </Button>
                    )}
                  </div>

                  {certificate &&
                    downloadMessage?.certificateId === certificate.id && (
                      <Alert
                        tone={
                          downloadMessage.tone === "success"
                            ? "success"
                            : "danger"
                        }
                      >
                        {downloadMessage.text}
                      </Alert>
                    )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {showCertificateSection && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-foreground">Mis certificados</h3>
          {certificatesLoading ? (
            <LoadingState label="Cargando certificados..." />
          ) : certificatesError ? (
            <ErrorState
              message={certificatesError}
              onRetry={() => void loadCertificates()}
            />
          ) : unlinkedCertificates.length === 0 ? (
            <EmptyState
              icon={<CertificateIcon width={32} height={32} />}
              title="Aún no tienes certificados"
              description="Cuando se emita un certificado para ti, podrás descargarlo aquí."
            />
          ) : (
            unlinkedCertificates.map((certificate) => (
              <Card key={certificate.id} className="flex flex-col gap-3">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:flex-1">
                    <CertificateIcon
                      width={22}
                      height={22}
                      className="shrink-0 text-primary"
                    />
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
                    className="w-full sm:w-auto sm:shrink-0"
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
      )}

      <RateActivityModal
        open={toRate !== null}
        activityName={toRate?.name ?? ""}
        onClose={() => setToRate(null)}
        onSubmit={submitReview}
      />
    </div>
  );
}
