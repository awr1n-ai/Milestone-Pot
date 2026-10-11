import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEventLogs } from "viem";
import type { Address } from "viem";
import { MILESTONE_POT_ABI, MILESTONE_POT_ADDRESS } from "../lib/contract";

export type CreatePotTxState = "idle" | "pending" | "success" | "error";

interface CreatePotArgs {
  recipient: Address;
  unlockTimestamp: bigint;
  targetAmountWei: bigint;
  initialContributionWei: bigint;
}

function formatTxError(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  const err = error as { name?: string; shortMessage?: string; message?: string };
  if (err.name === "UserRejectedRequestError" || /user rejected/i.test(err.message ?? "")) {
    return "You declined the request in your wallet.";
  }
  const msg = err.shortMessage ?? err.message ?? "Something went wrong. Please try again.";
  return msg.length > 200 ? `${msg.slice(0, 200)}…` : msg;
}

export function useCreatePot() {
  const {
    writeContractAsync,
    data: hash,
    error: writeError,
    status: writeStatus,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    error: receiptError,
    status: receiptStatus,
  } = useWaitForTransactionReceipt({ hash });

  const [potId, setPotId] = useState<bigint | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  useEffect(() => {
    const contractAddress = MILESTONE_POT_ADDRESS;
    if (!receipt || receipt.status !== "success" || !contractAddress) return;
    try {
      const events = parseEventLogs({
        abi: MILESTONE_POT_ABI,
        eventName: "PotCreated",
        logs: receipt.logs,
      });
      const match = events.find(
        (e) => e.address.toLowerCase() === contractAddress.toLowerCase(),
      );
      if (match) {
        setPotId(match.args.potId);
      } else {
        setParseWarning("Pot created, but we couldn't read its ID from the transaction logs.");
      }
    } catch {
      setParseWarning("Pot created, but we couldn't read its ID from the transaction logs.");
    }
  }, [receipt]);

  let status: CreatePotTxState = "idle";
  let errorMessage: string | undefined;

  if (writeStatus === "pending") {
    status = "pending";
  } else if (writeStatus === "error") {
    status = "error";
    errorMessage = formatTxError(writeError);
  } else if (writeStatus === "success") {
    if (receiptStatus === "pending") {
      status = "pending";
    } else if (receiptStatus === "error") {
      status = "error";
      errorMessage = formatTxError(receiptError);
    } else if (receiptStatus === "success") {
      if (receipt?.status === "reverted") {
        status = "error";
        errorMessage = "The transaction was rejected by the network. No pot was created.";
      } else {
        status = "success";
      }
    }
  }

  async function createPot(args: CreatePotArgs) {
    if (!MILESTONE_POT_ADDRESS) {
      throw new Error("Contract address is not configured.");
    }
    setPotId(null);
    setParseWarning(null);
    await writeContractAsync({
      address: MILESTONE_POT_ADDRESS,
      abi: MILESTONE_POT_ABI,
      functionName: "createPot",
      args: [args.recipient, args.unlockTimestamp, args.targetAmountWei],
      value: args.initialContributionWei,
    });
  }

  function reset() {
    resetWrite();
    setPotId(null);
    setParseWarning(null);
  }

  return {
    createPot,
    status,
    errorMessage,
    txHash: hash,
    potId,
    parseWarning,
    reset,
  };
}
