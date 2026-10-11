import { QueryClient } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { monadTestnet } from "./chain";

export const REOWN_PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
export const IS_WALLET_CONFIGURED = Boolean(REOWN_PROJECT_ID);

export const queryClient = new QueryClient();

const networks = [monadTestnet] as const;

const metadata = {
  name: "Milestone Pot",
  description: "A simple group gift pot that unlocks on a chosen date.",
  url: typeof window !== "undefined" ? window.location.origin : "https://milestonepot.app",
  icons: ["/favicon.svg"],
};

export const wagmiAdapter = IS_WALLET_CONFIGURED
  ? new WagmiAdapter({
      networks: [...networks],
      projectId: REOWN_PROJECT_ID as string,
    })
  : undefined;

if (IS_WALLET_CONFIGURED && wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [...networks],
    projectId: REOWN_PROJECT_ID as string,
    metadata,
    features: {
      analytics: false,
    },
  });
}
