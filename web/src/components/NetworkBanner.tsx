import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { TransactionStatus } from "./ui/TransactionStatus";
import { useMonadNetwork } from "../hooks/useMonadNetwork";
import styles from "./NetworkBanner.module.css";

export function NetworkBanner() {
  const { isConnected, isCorrectNetwork, switchToMonadTestnet, switchStatus, switchError } =
    useMonadNetwork();

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <Card className={styles.banner} padding="sm">
      <div className={styles.content}>
        <div>
          <p className={styles.title}>You're on the wrong network</p>
          <p className={styles.subtitle}>Switch to Monad Testnet to use Milestone Pot.</p>
        </div>
        <Button size="sm" onClick={switchToMonadTestnet} isLoading={switchStatus === "pending"}>
          Switch network
        </Button>
      </div>
      <TransactionStatus
        status={switchStatus}
        pendingLabel="Switching to Monad Testnet…"
        successLabel="Switched to Monad Testnet"
        errorMessage={
          switchError?.message ?? "Couldn't switch network. Try switching manually in your wallet."
        }
      />
    </Card>
  );
}
