import { useState } from "react";
import type { FormEvent } from "react";
import { parseEther } from "viem";
import { useConnection } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Status } from "./ui/Status";
import { TransactionStatus } from "./ui/TransactionStatus";
import { useCreatePot } from "../hooks/useCreatePot";
import { useMonadNetwork } from "../hooks/useMonadNetwork";
import { explorerTxUrl } from "../lib/chain";
import {
  minDateTimeLocalValue,
  validateOptionalMonAmount,
  validateRecipient,
  validateUnlockDateTime,
} from "../lib/validation";
import styles from "./CreatePotForm.module.css";

interface CreatePotFormProps {
  onClose: () => void;
}

interface FieldErrors {
  recipient?: string;
  unlock?: string;
  target?: string;
  initial?: string;
}

export function CreatePotForm({ onClose }: CreatePotFormProps) {
  const { isConnected } = useConnection();
  const { open } = useAppKit();
  const { isCorrectNetwork, switchToMonadTestnet, switchStatus } = useMonadNetwork();
  const { createPot, status, errorMessage, txHash, potId, parseWarning, reset } = useCreatePot();

  const [recipient, setRecipient] = useState("");
  const [unlockLocal, setUnlockLocal] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialContribution, setInitialContribution] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = status === "pending";

  function validate(): boolean {
    const errors: FieldErrors = {
      recipient: validateRecipient(recipient),
      unlock: validateUnlockDateTime(unlockLocal),
      target: validateOptionalMonAmount(targetAmount),
      initial: validateOptionalMonAmount(initialContribution),
    };
    setFieldErrors(errors);
    return !errors.recipient && !errors.unlock && !errors.target && !errors.initial;
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
    if (!validate()) return;

    try {
      await createPot({
        recipient: recipient.trim() as `0x${string}`,
        unlockTimestamp: BigInt(Math.floor(new Date(unlockLocal).getTime() / 1000)),
        targetAmountWei: targetAmount.trim() ? parseEther(targetAmount.trim()) : 0n,
        initialContributionWei: initialContribution.trim()
          ? parseEther(initialContribution.trim())
          : 0n,
      });
    } catch {
      // Reflected reactively via the hook's status/errorMessage — nothing else to do here.
    }
  }

  function handleCreateAnother() {
    reset();
    setRecipient("");
    setUnlockLocal("");
    setTargetAmount("");
    setInitialContribution("");
    setFieldErrors({});
  }

  if (status === "success" && potId !== null) {
    return (
      <div className={styles.successWrap}>
        <Status variant="success" label="Pot created" />
        <p className={styles.successPotId}>Pot #{potId.toString()}</p>
        <p className={styles.successBody}>
          Your pot is live on Monad Testnet. Share the pot ID with friends so they can
          contribute.
        </p>
        {parseWarning && <p className={styles.warning}>{parseWarning}</p>}
        {txHash && (
          <a className={styles.explorerLink} href={explorerTxUrl(txHash)} target="_blank" rel="noreferrer">
            View transaction on Monadscan
          </a>
        )}
        <div className={styles.successActions}>
          <Button variant="secondary" onClick={handleCreateAnother}>
            Create another pot
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  const primaryLabel = !isConnected
    ? "Connect wallet"
    : !isCorrectNetwork
      ? "Switch to Monad Testnet"
      : "Create pot";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Recipient wallet address"
        placeholder="0x…"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        error={fieldErrors.recipient}
        autoComplete="off"
        spellCheck={false}
        disabled={isPending}
      />
      <Input
        label="Unlock date"
        type="datetime-local"
        min={minDateTimeLocalValue()}
        value={unlockLocal}
        onChange={(e) => setUnlockLocal(e.target.value)}
        error={fieldErrors.unlock}
        disabled={isPending}
      />
      <Input
        label="Target amount — optional (MON)"
        placeholder="e.g. 2"
        inputMode="decimal"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        error={fieldErrors.target}
        disabled={isPending}
      />
      <Input
        label="Initial contribution — optional (MON)"
        placeholder="0"
        inputMode="decimal"
        value={initialContribution}
        onChange={(e) => setInitialContribution(e.target.value)}
        error={fieldErrors.initial}
        disabled={isPending}
      />

      <Button type="submit" fullWidth isLoading={isPending || switchStatus === "pending"}>
        {primaryLabel}
      </Button>

      <TransactionStatus
        status={status}
        pendingLabel="Confirm in your wallet, then wait for Monad to confirm…"
        successLabel="Pot created"
        errorMessage={errorMessage}
        txHash={txHash}
      />

      <p className={styles.helper}>Funds are secured on Monad until the unlock date you choose.</p>
    </form>
  );
}
