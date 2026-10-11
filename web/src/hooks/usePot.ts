import { useReadContract } from "wagmi";
import { MILESTONE_POT_ABI, MILESTONE_POT_ADDRESS } from "../lib/contract";
import { monadTestnet } from "../lib/chain";
import { potExistsFromStruct, type PotData } from "../lib/potStatus";

export function usePot(potId: bigint | null) {
  const { data, isLoading, isError, error, refetch, isFetching } = useReadContract({
    address: MILESTONE_POT_ADDRESS,
    abi: MILESTONE_POT_ABI,
    functionName: "getPot",
    args: potId !== null ? [potId] : undefined,
    chainId: monadTestnet.id,
    query: {
      enabled: potId !== null && Boolean(MILESTONE_POT_ADDRESS),
    },
  });

  const pot: PotData | undefined = data
    ? {
        creator: data.creator,
        recipient: data.recipient,
        unlockTimestamp: data.unlockTimestamp,
        targetAmount: data.targetAmount,
        totalContributed: data.totalContributed,
        claimed: data.claimed,
      }
    : undefined;

  const exists = pot ? potExistsFromStruct(pot) : undefined;

  return { pot, exists, isLoading, isFetching, isError, error, refetch };
}
