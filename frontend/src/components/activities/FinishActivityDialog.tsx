import { Button } from "../ui";

interface FinishActivityDialogProps {
  enrolledCount: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function FinishActivityDialog({
  enrolledCount,
  busy,
  onCancel,
  onConfirm,
}: FinishActivityDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        aria-labelledby="finish-activity-title"
        aria-describedby="finish-activity-description"
        aria-modal="true"
        className="w-full max-w-md rounded-card border border-primary/20 bg-white p-6 shadow-2xl"
        role="alertdialog"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Finalización anticipada
        </p>
        <h2
          className="text-lg font-bold text-foreground"
          id="finish-activity-title"
        >
          ¿Finalizar esta actividad ahora?
        </h2>
        <p
          className="mt-3 text-sm leading-relaxed text-muted"
          id="finish-activity-description"
        >
          Hay {enrolledCount}{" "}
          {enrolledCount === 1
            ? "estudiante inscrito"
            : "estudiantes inscritos"}
          . La actividad se finalizará antes de su horario programado. Solo se
          podrá registrar asistencia en sesiones que ya hayan terminado.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            autoFocus
            disabled={busy}
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button loading={busy} onClick={onConfirm}>
            Sí, finalizar
          </Button>
        </div>
      </section>
    </div>
  );
}
