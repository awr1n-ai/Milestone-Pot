import { useEffect, useState } from "react";
import { useConnection } from "wagmi";
import { formatEther } from "viem";
import { Card } from "./ui/Card";
import { Status } from "./ui/Status";
import { Skeleton } from "./ui/Skeleton";
import { ProgressBar } from "./ui/ProgressBar";
import { ContributeForm } from "./ContributeForm";
import { ClaimPanel } from "./ClaimPanel";
import { usePot } from "../hooks/usePot";
import { derivePotStatus } from "../lib/potStatus";
import { explorerAddressUrl } from "../lib/chain";
import styles from "./PotDetails.module.css";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function useCountdown(unlockTimestamp: bigint | undefined) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (unlockTimestamp === undefined) return;
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, [unlockTimestamp]);

  if (unlockTimestamp === undefined) return { now, label: "" };

  const remaining = Number(unlockTimestamp) - now;
  if (remaining <= 0) return { now, label: "Unlocked" };

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  if (days === 0) parts.push(`${minutes}m`);
  if (days === 0 && hours === 0) parts.push(`${seconds}s`);

  return { now, label: parts.join(" ") };
}

interface PotDetailsProps {
  potId: bigint;
}

export function PotDetails({ potId }: PotDetailsProps) {
  const { pot, exists, isLoading, isError, refetch } = usePot(potId);
  const { now, label: countdownLabel } = useCountdown(pot?.unlockTimestamp);
  const { address } = useConnection();

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <Skeleton height={24} width="40%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={10} width="100%" />
        <Skeleton height={44} width="100%" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.emptyState}>
        <Status variant="error" label="Couldn't load pot" />
        <p className={styles.emptyBody}>
          We couldn't reach Monad Testnet to load this pot. Check your connection and try again.
        </p>
      </div>
    );
  }

  if (!pot || exists === false) {
    return (
      <div className={styles.emptyState}>
        <Status variant="neutral" label="Not found" />
        <p className={styles.emptyBody}>
          No pot exists with this ID yet. Double-check the ID or create a new pot.
        </p>
      </div>
    );
  }

  const lifecycle = derivePotStatus(pot, now);
  const hasTarget = pot.targetAmount > 0n;
  const raised = Number(formatEther(pot.totalContributed));
  const target = hasTarget ? Number(formatEther(pot.targetAmount)) : 0;

  const statusVariant = lifecycle === "claimed" ? "completed" : lifecycle === "unlocked" ? "unlocked" : "locked";
  const statusLabel = lifecycle === "claimed" ? "Claimed" : lifecycle === "unlocked" ? "Unlocked" : "Locked";
  const isRecipient = address?.toLowerCase() === pot.recipient.toLowerCase();

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <Status variant={statusVariant} label={statusLabel} />
        <span className={styles.potId}>Pot #{potId.toString()}</span>
      </div>

      <div className={styles.amountBlock}>
        <span className={styles.amountValue}>{raised.toFixed(4)} MON</span>
        <span className={styles.amountLabel}>
          {hasTarget ? `raised of ${target.toFixed(4)} MON target` : "raised so far"}
        </span>
      </div>

      {hasTarget && <ProgressBar value={raised} max={target} label="Pot progress toward target" />}

      <Card padding="sm" className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>Recipient</span>
          <a
            className={styles.infoValue}
            href={explorerAddressUrl(pot.recipient)}
            target="_blank"
            rel="noreferrer"
          >
            {truncateAddress(pot.recipient)}
          </a>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>{lifecycle === "locked" ? "Unlocks in" : "Unlock date"}</span>
          <span className={styles.infoValue}>
            {lifecycle === "locked"
              ? countdownLabel
              : new Date(Number(pot.unlockTimestamp) * 1000).toLocaleString()}
          </span>
        </div>
      </Card>

      {lifecycle === "locked" && isRecipient && (
        <p className={styles.note}>You'll be able to claim this pot once it unlocks.</p>
      )}
      {lifecycle === "claimed" && (
        <p className={styles.note}>This pot has already been claimed by its recipient.</p>
      )}
      {lifecycle === "unlocked" && (
        <p className={styles.note}>
          This pot is unlocked — its recipient can claim the funds. You can still contribute more
          until they do.
        </p>
      )}

      {lifecycle === "unlocked" && (
        <div className={styles.contributeSection}>
          <h3 className={styles.contributeTitle}>Claim funds</h3>
          <ClaimPanel potId={potId} recipient={pot.recipient} onClaimed={() => refetch()} />
        </div>
      )}

      {lifecycle !== "claimed" && (
        <div className={styles.contributeSection}>
          <h3 className={styles.contributeTitle}>Add to this pot</h3>
          <ContributeForm potId={potId} onContributed={() => refetch()} />
        </div>
      )}
    </div>
  );
}
