import styles from "./Status.module.css";

export type StatusVariant =
  | "pending"
  | "locked"
  | "unlocked"
  | "completed"
  | "rejected"
  | "failed"
  | "success"
  | "error"
  | "info"
  | "neutral";

const DEFAULT_LABELS: Record<StatusVariant, string> = {
  pending: "Pending",
  locked: "Locked",
  unlocked: "Unlocked",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
  success: "Success",
  error: "Error",
  info: "Info",
  neutral: "—",
};

interface StatusProps {
  variant: StatusVariant;
  label?: string;
}

export function Status({ variant, label }: StatusProps) {
  return (
    <span className={[styles.status, styles[variant]].join(" ")}>
      <span className={styles.dot} aria-hidden="true" />
      {label ?? DEFAULT_LABELS[variant]}
    </span>
  );
}
