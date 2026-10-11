import styles from "./TransactionStatus.module.css";
import { Status } from "./Status";
import { LoadingState } from "./LoadingState";
import { explorerTxUrl } from "../../lib/chain";

export type TxState = "idle" | "pending" | "success" | "error";

interface TransactionStatusProps {
  status: TxState;
  pendingLabel?: string;
  successLabel?: string;
  errorMessage?: string;
  txHash?: string;
}

export function TransactionStatus({
  status,
  pendingLabel = "Waiting for confirmation…",
  successLabel = "Confirmed",
  errorMessage = "Something went wrong. Please try again.",
  txHash,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  if (status === "pending") {
    return (
      <div className={styles.row}>
        <LoadingState label={pendingLabel} size="sm" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={styles.row}>
        <Status variant="success" label={successLabel} />
        {txHash && (
          <a
            className={styles.link}
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
          >
            View on Monadscan
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <Status variant="error" label="Failed" />
      <p className={styles.errorMessage}>{errorMessage}</p>
    </div>
  );
}
