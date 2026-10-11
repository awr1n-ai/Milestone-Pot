import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function LoadingState({ label, size = "md", fullScreen = false }: LoadingStateProps) {
  const content = (
    <div className={styles.wrapper}>
      <span className={[styles.spinner, styles[size]].join(" ")} aria-hidden="true" />
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreen} role="status" aria-live="polite">
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      {content}
    </div>
  );
}
