import { useState } from "react";
import { useConnection, useBalance, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Status } from "../ui/Status";
import { monadTestnet, explorerAddressUrl } from "../../lib/chain";
import styles from "./AccountButton.module.css";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AccountButton() {
  const { open } = useAppKit();
  const { address, isConnected, isConnecting, isReconnecting, chainId } = useConnection();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: Boolean(address) && chainId === monadTestnet.id },
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isConnecting || isReconnecting) {
    return (
      <Button variant="secondary" size="sm" isLoading disabled>
        Connecting…
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <Button variant="primary" size="sm" onClick={() => open()}>
        Connect wallet
      </Button>
    );
  }

  const onMonad = chainId === monadTestnet.id;

  return (
    <>
      <button type="button" className={styles.chip} onClick={() => setIsMenuOpen(true)}>
        <span className={[styles.dot, onMonad ? styles.dotOk : styles.dotWarn].join(" ")} aria-hidden="true" />
        {truncateAddress(address)}
      </button>

      <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Your account">
        <div className={styles.menu}>
          <div className={styles.row}>
            <span>Network</span>
            <Status
              variant={onMonad ? "unlocked" : "rejected"}
              label={onMonad ? "Monad Testnet" : "Wrong network"}
            />
          </div>
          <div className={styles.row}>
            <span>Address</span>
            <a href={explorerAddressUrl(address)} target="_blank" rel="noreferrer">
              {truncateAddress(address)}
            </a>
          </div>
          {balance && (
            <div className={styles.row}>
              <span>Balance</span>
              <span>
                {Number(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
              </span>
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={() => {
              disconnect();
              setIsMenuOpen(false);
            }}
          >
            Disconnect
          </Button>
        </div>
      </Modal>
    </>
  );
}
