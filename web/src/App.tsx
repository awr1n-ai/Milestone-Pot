import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Header } from "./components/layout/Header";
import { NetworkBanner } from "./components/layout/NetworkBanner";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Modal } from "./components/ui/Modal";
import { Status } from "./components/ui/Status";
import { GiftIllustration } from "./components/GiftIllustration";
import { CreatePotForm } from "./components/CreatePotForm";
import { PotDetails } from "./components/PotDetails";
import styles from "./App.module.css";

type ActiveModal = "create" | "view" | null;

function readPotIdFromUrl(): bigint | null {
  const raw = new URLSearchParams(window.location.search).get("pot");
  if (!raw || !/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [viewPotIdInput, setViewPotIdInput] = useState("");
  const [viewedPotId, setViewedPotId] = useState<bigint | null>(null);

  useEffect(() => {
    const fromUrl = readPotIdFromUrl();
    if (fromUrl !== null) {
      setViewedPotId(fromUrl);
      setViewPotIdInput(fromUrl.toString());
      setActiveModal("view");
    }
  }, []);

  function openViewModal() {
    setActiveModal("view");
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handleViewSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(viewPotIdInput.trim())) return;
    const id = BigInt(viewPotIdInput.trim());
    setViewedPotId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("pot", id.toString());
    window.history.pushState({}, "", url);
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <NetworkBanner />

        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              One pot. <span className={styles.titleAccent}>Everyone chips in.</span>
            </h1>
            <p className={styles.tagline}>
              Bring everyone together for one meaningful gift — secured on-chain, unlocked on the
              day that matters.
            </p>

            <div className={styles.actions}>
              <Button size="lg" onClick={() => setActiveModal("create")}>
                Create a pot
              </Button>
              <Button size="lg" variant="secondary" onClick={openViewModal}>
                View a pot
              </Button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <GiftIllustration />
          </div>
        </section>

        <section className={styles.trustSection}>
          <Card className={styles.trustCard}>
            <Status variant="locked" label="Secured on-chain" />
            <h2 className={styles.trustTitle}>Your gift, safely held until the big day</h2>
            <p className={styles.trustBody}>
              Every contribution is recorded on Monad, a fast public settlement network, so
              everyone can see the pot filling up. Only the recipient you choose can withdraw it,
              and only once the date you set has arrived. No crypto knowledge needed on either
              side.
            </p>
          </Card>
        </section>
      </main>

      <Modal
        isOpen={activeModal === "create"}
        onClose={closeModal}
        title="Create a pot"
      >
        <CreatePotForm onClose={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === "view"} onClose={closeModal} title="View a pot">
        {viewedPotId === null ? (
          <form className={styles.viewForm} onSubmit={handleViewSubmit}>
            <Input
              label="Pot ID"
              placeholder="e.g. 0"
              inputMode="numeric"
              value={viewPotIdInput}
              onChange={(e) => setViewPotIdInput(e.target.value)}
            />
            <Button type="submit" fullWidth>
              View pot
            </Button>
          </form>
        ) : (
          <>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => {
                setViewedPotId(null);
                const url = new URL(window.location.href);
                url.searchParams.delete("pot");
                window.history.pushState({}, "", url);
              }}
            >
              ← Look up a different pot
            </button>
            <PotDetails potId={viewedPotId} />
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
