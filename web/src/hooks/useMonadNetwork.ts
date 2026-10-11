import { useConnection, useSwitchChain } from "wagmi";
import { monadTestnet } from "../lib/chain";

export function useMonadNetwork() {
  const { chainId, isConnected } = useConnection();
  const { switchChain, status, error, reset } = useSwitchChain();

  const isCorrectNetwork = isConnected && chainId === monadTestnet.id;

  return {
    isConnected,
    isCorrectNetwork,
    currentChainId: chainId,
    switchToMonadTestnet: () => switchChain({ chainId: monadTestnet.id }),
    switchStatus: status,
    switchError: error,
    resetSwitch: reset,
  };
}
