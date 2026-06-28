import type { ReactNode } from "react";

type Tone = "info" | "risk" | "gold";

/**
 * Callout — porté du design system S'investir Simulateurs (Callout.jsx).
 * Panneau teinté sombre avec icône (i) et texte pédagogique / légal.
 */
export function Callout({
  tone = "info",
  icon,
  children,
  className = "",
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<Tone, { bg: string; rail: string }> = {
    info: { bg: "var(--info-soft)", rail: "var(--blue-400)" },
    risk: { bg: "var(--negative-soft)", rail: "var(--negative)" },
    gold: { bg: "var(--accent-gold-soft)", rail: "var(--accent-gold)" },
  };
  const t = tones[tone];

  return (
    <div
      role="note"
      className={`flex gap-3.5 ${className}`}
      style={{
        background: t.bg,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.15rem",
      }}
    >
      {icon && (
        <span className="mt-0.5 inline-flex shrink-0" style={{ color: t.rail }}>
          {icon}
        </span>
      )}
      <div className="min-w-0 text-[0.9375rem] leading-relaxed text-sx-muted">
        {children}
      </div>
    </div>
  );
}
