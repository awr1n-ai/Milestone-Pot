import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { MILESTONE_POT_ABI, MILESTONE_POT_ADDRESS } from "../lib/contract";

export type ClaimTxState = "idle" | "pending" | "success" | "error";

function formatTxError(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  const err = error as { name?: string; shortMessage?: string; message?: string };
  if (err.name === "UserRejectedRequestError" || /user rejected/i.test(err.message ?? "")) {
    return "You declined the request in your wallet.";
  }
  const combined = `${err.shortMessage ?? ""} ${err.message ?? ""}`;
  if (/NotRecipient/.test(combined)) {
    return "Only the designated recipient can claim this pot.";
  }
  if (/NotYetUnlocked/.test(combined)) {
    return "This pot hasn't unlocked yet.";
  }
  if (/PotAlreadyClaimed/.test(combined)) {
    return "This pot has already been claimed.";
  }
  if (/PotDoesNotExist/.test(combined)) {
    return "This pot doesn't exist.";
  }
  const msg = err.shortMessage ?? err.message ?? "Something went wrong. Please try again.";
  return msg.length > 200 ? `${msg.slice(0, 200)}…` : msg;
}

export function useClaim() {
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

  let status: ClaimTxState = "idle";
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
        errorMessage = "The transaction was rejected by the network. The pot was not claimed.";
      } else {
        status = "success";
      }
    }
  }

  async function claim(potId: bigint) {
    if (!MILESTONE_POT_ADDRESS) {
      throw new Error("Contract address is not configured.");
    }
    await writeContractAsync({
      address: MILESTONE_POT_ADDRESS,
      abi: MILESTONE_POT_ABI,
      functionName: "claim",
      args: [potId],
    });
  }

  return { claim, status, errorMessage, txHash: hash, reset: resetWrite };
}
