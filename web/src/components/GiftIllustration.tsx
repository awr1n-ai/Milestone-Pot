import styles from "./GiftIllustration.module.css";

export function GiftIllustration() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.glow} />
      <svg
        className={styles.svg}
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="potGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="coinGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>

        {/* orbiting coins */}
        <circle cx="70" cy="90" r="16" fill="url(#coinGradient)" opacity="0.9" />
        <circle cx="250" cy="70" r="12" fill="url(#coinGradient)" opacity="0.7" />
        <circle cx="258" cy="190" r="18" fill="url(#coinGradient)" opacity="0.8" />
        <circle cx="48" cy="210" r="10" fill="url(#coinGradient)" opacity="0.6" />

        {/* pot body */}
        <path
          d="M90 150 L230 150 L214 268 Q212 282 198 282 L122 282 Q108 282 106 268 Z"
          fill="url(#potGradient)"
        />
        {/* pot rim */}
        <rect x="78" y="128" width="164" height="30" rx="15" fill="url(#potGradient)" />
        {/* rim highlight */}
        <rect x="78" y="128" width="164" height="12" rx="6" fill="#ffffff" opacity="0.18" />

        {/* ribbon vertical */}
        <rect x="150" y="60" width="20" height="98" rx="4" fill="#ffffff" opacity="0.85" />
        {/* ribbon bow */}
        <path
          d="M160 68 C140 48 108 52 108 76 C108 94 134 96 160 80 C186 96 212 94 212 76 C212 52 180 48 160 68 Z"
          fill="#ffffff"
        />
        <circle cx="160" cy="70" r="9" fill="#c4b5fd" />
      </svg>
    </div>
  );
}
