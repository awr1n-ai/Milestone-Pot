import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, wagmiAdapter, IS_WALLET_CONFIGURED } from "../lib/appkit";
import { Card } from "../components/ui/Card";
import styles from "./AppKitProvider.module.css";

export function AppKitProvider({ children }: { children: ReactNode }) {
  if (!IS_WALLET_CONFIGURED || !wagmiAdapter) {
    return (
      <div className={styles.notice}>
        <Card>
          <h2 className={styles.title}>Wallet connection not configured</h2>
          <p className={styles.body}>
            Set <code>VITE_REOWN_PROJECT_ID</code> in <code>web/.env</code> to enable wallet
            connection. Get a free project ID at{" "}
            <a href="https://dashboard.reown.com" target="_blank" rel="noreferrer">
              dashboard.reown.com
            </a>
            .
          </p>
        </Card>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
