import { InfoBadge } from "@/components/ui/InfoBadge";

/**
 * Field — variante "underline" du design system S'investir (Input.jsx) :
 * label + (i), valeur en grand (fs-heading-m), suffixe d'unité aligné à droite,
 * fine bordure basse 1.5px qui passe au bleu au focus.
 */
export function Field({
  label,
  hint,
  suffix,
  children,
}: {
  label: string;
  hint?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[0.9375rem] font-medium text-sx-muted">{label}</span>
        {hint && <InfoBadge text={hint} />}
      </div>
      <div
        className="flex items-baseline gap-2 pb-2.5 transition-colors focus-within:[border-color:var(--brand)]"
        style={{ borderBottom: "1.5px solid var(--border-strong)" }}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {suffix && (
          <span className="eyebrow shrink-0 text-sx-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}
