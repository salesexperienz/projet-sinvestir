"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "white" | "secondary" | "gold";
type Size = "sm" | "md" | "lg";

/**
 * Button — porté du design system S'investir Simulateurs (Button.jsx).
 * Pill, variantes primary (bleu royal) / white / secondary / gold.
 */
export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  block = false,
  children,
  style,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  block?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes: Record<Size, string> = {
    sm: "px-[1.05rem] py-2 text-[0.9375rem] gap-1.5",
    md: "px-[1.4rem] py-[0.72rem] text-base gap-2",
    lg: "px-[1.7rem] py-[0.95rem] text-[1.0625rem] gap-2",
  };

  const variants: Record<Variant, string> = {
    primary: "text-white",
    white: "bg-white text-[#0a0e1a]",
    secondary: "text-sx-text",
    gold: "text-[#070a12]",
  };

  const inlineByVariant: Record<Variant, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(120deg, #3a6fe0 0%, #2a55c4 50%, #16265f 100%)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    },
    white: { boxShadow: "0 6px 18px rgba(0,0,0,0.35)" },
    secondary: {
      background: "var(--surface-input)",
      border: "1px solid var(--border-strong)",
    },
    gold: { background: "var(--accent-gold)", boxShadow: "var(--glow-gold)" },
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold leading-tight transition-[filter] hover:brightness-[1.08] ${
        sizes[size]
      } ${variants[variant]} ${block ? "w-full" : ""}`}
      style={{ ...inlineByVariant[variant], ...style }}
      {...rest}
    >
      {iconLeft && <span className="-ml-0.5 inline-flex">{iconLeft}</span>}
      {children}
    </button>
  );
}
