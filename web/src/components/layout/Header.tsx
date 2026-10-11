import { AccountButton } from "./AccountButton";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          🎁
        </span>
        <span className={styles.name}>Milestone Pot</span>
      </div>
      <AccountButton />
    </header>
  );
}
