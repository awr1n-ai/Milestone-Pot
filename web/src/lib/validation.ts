import { isAddress, parseEther, zeroAddress } from "viem";

export function validateRecipient(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Enter the recipient's wallet address.";
  if (!isAddress(trimmed)) return "That doesn't look like a valid wallet address.";
  if (trimmed.toLowerCase() === zeroAddress) return "Recipient can't be the zero address.";
  return undefined;
}

export function validateUnlockDateTime(localDateTimeValue: string): string | undefined {
  if (!localDateTimeValue) return "Choose when the pot unlocks.";
  const ms = new Date(localDateTimeValue).getTime();
  if (!Number.isFinite(ms)) return "Enter a valid date and time.";
  const unlockSeconds = Math.floor(ms / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (unlockSeconds <= nowSeconds) return "Unlock date must be in the future.";
  return undefined;
}

export function validateOptionalMonAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    if (parseEther(trimmed) < 0n) return "Enter a valid MON amount.";
  } catch {
    return "Enter a valid MON amount.";
  }
  return undefined;
}

export function minDateTimeLocalValue(bufferMs = 60_000): string {
  const d = new Date(Date.now() + bufferMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
