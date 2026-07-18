import type { ReactNode } from "react";

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Carregando" />;
}

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="state-center">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-center">
      <div className="big">{title}</div>
      {hint && <span>{hint}</span>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="banner error" role="alert">
      <span aria-hidden>⚠</span>
      <span>{message}</span>
    </div>
  );
}

export function Plate({ children }: { children: ReactNode }) {
  return <span className="plate">{children}</span>;
}

export function Tag({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "teal" | "amber" | "red";
}) {
  return <span className={`tag ${tone ?? ""}`}>{children}</span>;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}
