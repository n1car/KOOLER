"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { ActivityStatus } from "@/lib/types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------- Button ------------------------------- */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground active:bg-blue-600",
  secondary: "bg-surface-2 text-foreground active:bg-border",
  outline:
    "border border-border bg-transparent text-foreground active:bg-surface-2",
  ghost: "bg-transparent text-primary active:bg-surface-2",
  danger: "bg-danger text-white active:bg-red-600",
  success: "bg-success text-white active:bg-green-600",
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-input px-5 py-3 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ------------------------------- Fields ------------------------------- */

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-semibold text-foreground">{label}</span>
      )}
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

const controlClass =
  "w-full rounded-input border border-border bg-white px-4 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input className={cn(controlClass, className)} {...props} />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  ...props
}: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea className={cn(controlClass, "min-h-24", className)} {...props} />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select
        className={cn(controlClass, "appearance-none bg-white", className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------- Badge -------------------------------- */

const statusStyles: Record<ActivityStatus, string> = {
  ACTIVE: "bg-success/10 text-success",
  FINISHED: "bg-surface-2 text-muted",
  CANCELLED: "bg-danger/10 text-danger",
};

const statusLabels: Record<ActivityStatus, string> = {
  ACTIVE: "Activa",
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
};

export function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    muted: "bg-surface-2 text-muted",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------- ProgressBar ----------------------------- */

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped >= 100 ? "bg-success" : "bg-primary";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/* ------------------------------- Stars -------------------------------- */

export function Stars({
  value,
  onChange,
  readOnly = false,
  size = 22,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            aria-label={`${star} estrellas`}
            className={cn(
              "leading-none",
              readOnly ? "cursor-default" : "cursor-pointer",
              filled ? "text-[#FFCC00]" : "text-border",
            )}
            style={{ fontSize: size }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------- EmptyState ------------------------------ */

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}

/* ------------------------------ Spinner ------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className ?? "h-5 w-5",
      )}
    />
  );
}

/* ------------------------------ Avatar -------------------------------- */

export function Avatar({
  firstName,
  lastName,
  size = 40,
}: {
  firstName: string;
  lastName: string;
  size?: number;
}) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

/* ---------------------------- Alert (error) --------------------------- */

export function Alert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "success" | "info";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    info: "bg-primary/10 text-primary",
  };
  return (
    <div className={cn("rounded-input px-4 py-3 text-sm font-medium", tones[tone])}>
      {children}
    </div>
  );
}
