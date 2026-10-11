import { monadTestnet } from "@reown/appkit/networks";

export { monadTestnet };

export const MONAD_TESTNET_EXPLORER_URL =
  import.meta.env.VITE_MONAD_TESTNET_EXPLORER_URL || "https://testnet.monadscan.com";

export function explorerTxUrl(hash: string) {
  return `${MONAD_TESTNET_EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${MONAD_TESTNET_EXPLORER_URL}/address/${address}`;
}
