export type PotLifecycleStatus = "locked" | "unlocked" | "claimed";

export interface PotData {
  creator: `0x${string}`;
  recipient: `0x${string}`;
  unlockTimestamp: bigint;
  targetAmount: bigint;
  totalContributed: bigint;
  claimed: boolean;
}

export function derivePotStatus(pot: PotData, nowSeconds: number): PotLifecycleStatus {
  if (pot.claimed) return "claimed";
  if (BigInt(nowSeconds) >= pot.unlockTimestamp) return "unlocked";
  return "locked";
}

export function potExistsFromStruct(pot: PotData): boolean {
  return pot.recipient !== "0x0000000000000000000000000000000000000000";
}
