import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { formatEther, parseEther } from "viem";
import { useConnection } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { TransactionStatus } from "./ui/TransactionStatus";
import { useContribute } from "../hooks/useContribute";
import { useMonadNetwork } from "../hooks/useMonadNetwork";
import { validateOptionalMonAmount } from "../lib/validation";
import styles from "./ContributeForm.module.css";

const QUICK_AMOUNTS = ["0.1", "0.5", "1"];

interface ContributeFormProps {
  potId: bigint;
  onContributed: () => void;
}

export function ContributeForm({ potId, onContributed }: ContributeFormProps) {
  const { isConnected } = useConnection();
  const { open } = useAppKit();
  const { isCorrectNetwork, switchToMonadTestnet, switchStatus } = useMonadNetwork();
  const { contribute, status, errorMessage, txHash, reset } = useContribute();

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();

  const isPending = status === "pending";

  // Guards against re-notifying the parent if `onContributed`'s identity
  // changes across re-renders (e.g. PotDetails' live countdown) while the
  // same confirmed transaction is still the current one.
  const notifiedHashRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (status === "success" && txHash && notifiedHashRef.current !== txHash) {
      notifiedHashRef.current = txHash;
      onContributed();
    }
  }, [status, txHash, onContributed]);

  function validateAmount(): boolean {
    if (!amount.trim()) {
      setAmountError("Enter an amount to contribute.");
      return false;
    }
    const genericError = validateOptionalMonAmount(amount);
    if (genericError) {
      setAmountError(genericError);
      return false;
    }
    if (parseEther(amount.trim()) === 0n) {
      setAmountError("Amount must be greater than zero.");
      return false;
    }
    setAmountError(undefined);
    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isConnected) {
      open();
      return;
    }
    if (!isCorrectNetwork) {
      switchToMonadTestnet();
      return;
    }
    if (!validateAmount()) return;

    try {
      await contribute(potId, parseEther(amount.trim()));
    } catch {
      // Reflected reactively via the hook's status/errorMessage.
      // The pot refresh itself is driven by the status effect above,
      // which only fires once the transaction receipt confirms success.
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successRow}>
        <TransactionStatus status="success" successLabel="Contribution confirmed" txHash={txHash} />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            reset();
            setAmount("");
          }}
        >
          Contribute again
        </Button>
      </div>
    );
  }

  const primaryLabel = !isConnected
    ? "Connect wallet"
    : !isCorrectNetwork
      ? "Switch to Monad Testnet"
      : "Contribute";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.quickRow}>
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.quickChip}
            onClick={() => {
              setAmount(value);
              setAmountError(undefined);
            }}
            disabled={isPending}
          >
            {value} MON
          </button>
        ))}
      </div>

      <Input
        label="Contribution amount (MON)"
        placeholder="e.g. 0.5"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          if (amountError) setAmountError(undefined);
        }}
        error={amountError}
        disabled={isPending}
      />

      {amount.trim() && !amountError && (
        <p className={styles.preview}>
          You're sending <strong>{formatEther(tryParse(amount))} MON</strong> to this pot.
        </p>
      )}

      <Button type="submit" fullWidth isLoading={isPending || switchStatus === "pending"}>
        {primaryLabel}
      </Button>

      <TransactionStatus
        status={status}
        pendingLabel="Confirm in your wallet, then wait for Monad to confirm…"
        errorMessage={errorMessage}
        txHash={txHash}
      />
    </form>
  );
}

function tryParse(value: string): bigint {
  try {
    return parseEther(value.trim());
  } catch {
    return 0n;
  }
}
