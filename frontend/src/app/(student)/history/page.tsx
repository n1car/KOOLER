"use client";

import { useState } from "react";
import { Button, Card, EmptyState, Stars, Textarea } from "@/components/ui";
import { CertificateIcon, HistoryIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { mockCertificates, mockHistory } from "@/lib/mock";
import type { HistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>(mockHistory);
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

      {items.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon width={36} height={36} />}
          title="Sin actividades finalizadas"
          description="Aquí verás las actividades certificadas que ya completaste."
        />
      ) : (
        items.map((item) => {
          const certificate =
            mockCertificates.find((c) => c.activityId === item.activityId) ??
            null;
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

              {certificate && (
                <Button variant="outline" fullWidth>
                  <CertificateIcon width={18} height={18} />
                  Ver certificado
                </Button>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
