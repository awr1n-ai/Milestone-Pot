import { useEffect } from "react";
import { useConnection } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { Address } from "viem";
import { Button } from "./ui/Button";
import { TransactionStatus } from "./ui/TransactionStatus";
import { useClaim } from "../hooks/useClaim";
import { useMonadNetwork } from "../hooks/useMonadNetwork";
import styles from "./ClaimPanel.module.css";

interface ClaimPanelProps {
  potId: bigint;
  recipient: Address;
  onClaimed: () => void;
}

export function ClaimPanel({ potId, recipient, onClaimed }: ClaimPanelProps) {
  const { address, isConnected } = useConnection();
  const { open } = useAppKit();
  const { isCorrectNetwork, switchToMonadTestnet, switchStatus } = useMonadNetwork();
  const { claim, status, errorMessage, txHash } = useClaim();

  const isRecipient = address?.toLowerCase() === recipient.toLowerCase();

  useEffect(() => {
    if (status === "success") {
      onClaimed();
    }
  }, [status, onClaimed]);

  async function handleClaim() {
    if (!isConnected) {
      open();
      return;
    }
    if (!isCorrectNetwork) {
      switchToMonadTestnet();
      return;
    }
    try {
      await claim(potId);
    } catch {
      // Reflected reactively via the hook's status/errorMessage.
    }
  }

  if (status === "success") {
    return (
      <div className={styles.row}>
        <TransactionStatus status="success" successLabel="Funds claimed" txHash={txHash} />
      </div>
    );
  }

  if (isConnected && isCorrectNetwork && !isRecipient) {
    return <p className={styles.restricted}>Only the designated recipient can claim this pot.</p>;
  }

  const primaryLabel = !isConnected
    ? "Connect wallet"
    : !isCorrectNetwork
      ? "Switch to Monad Testnet"
      : "Claim funds";

  return (
    <div className={styles.panel}>
      <Button
        type="button"
        fullWidth
        onClick={handleClaim}
        isLoading={status === "pending" || switchStatus === "pending"}
      >
        {primaryLabel}
      </Button>

      {!isConnected && (
        <p className={styles.hint}>Only the pot's recipient can claim. Connect your wallet to check.</p>
      )}

      <TransactionStatus
        status={status}
        pendingLabel="Confirm in your wallet, then wait for Monad to confirm your claim…"
        errorMessage={errorMessage}
        txHash={txHash}
      />
    </div>
  );
}
