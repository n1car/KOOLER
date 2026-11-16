"use client";

import { useState } from "react";
import { Alert, Button, Stars, Textarea } from "./ui";

export function RateActivityModal({
  open,
  activityName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  activityName: string;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => Promise<void>;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    setStars(0);
    setComment("");
    setError(null);
    onClose();
  }

  async function handleSend() {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(stars, comment.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu calificación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 pb-6 lg:items-center">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-bold text-foreground">Calificar actividad</h2>
          <p className="text-sm text-muted">{activityName}</p>
        </div>

        <div className="mb-4 flex justify-center">
          <Stars value={stars} onChange={setStars} size={36} />
        </div>

        <Textarea
          label="Comentario (opcional)"
          placeholder="Cuéntanos qué te pareció"
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && (
          <div className="mt-4">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button fullWidth loading={loading} disabled={stars === 0} onClick={handleSend}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}