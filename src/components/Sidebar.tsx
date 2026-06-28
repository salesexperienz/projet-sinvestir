"use client";

import { useState } from "react";
import {
  IconDashboard,
  IconChart,
  IconCompare,
  IconBookmark,
  IconGift,
  IconGear,
  IconBulb,
  IconLogout,
  IconChevron,
} from "./icons";

const SUITE = "https://simulateurs.sinvestir.fr";

const NAV = [
  { label: "Tableau de bord", icon: IconDashboard, href: SUITE },
  {
    label: "Les simulateurs",
    icon: IconChart,
    href: `${SUITE}/les-simulateurs`,
    active: true,
  },
  {
    label: "Les comparateurs",
    icon: IconCompare,
    href: `${SUITE}/les-comparateurs`,
  },
  {
    label: "Mes simulations",
    icon: IconBookmark,
    href: `${SUITE}/mes-simulations`,
  },
  {
    label: "Formation offerte",
    icon: IconGift,
    href: `${SUITE}/formation-offerte`,
  },
];

/**
 * Sidebar de l'espace S'investir Simulateurs (reproduction fidèle).
 * Liens branchés vers la suite simulateurs.sinvestir.fr.
 * Repliable comme l'originale (chevron sur le bord droit).
 */
export function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`relative hidden shrink-0 lg:block transition-[width] duration-300 ${
        open ? "w-[270px]" : "w-[88px]"
      }`}
    >
      <div className="sticky top-4 m-3 flex h-[calc(100vh-2rem)] flex-col rounded-3xl bg-sx-panel/80 ring-1 ring-white/5 backdrop-blur">
        {/* Profil */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-sx-muted ring-1 ring-white/10">
            JD
          </div>
          {open && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sx-text">
                Jean Dupont
              </p>
              <p className="truncate text-xs text-sx-faint">
                jean-dupont@sinvestir.fr
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-1 flex-col gap-2 px-3">
          {NAV.map(({ label, icon: Icon, active, href }) => (
            <a
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3.5 rounded-xl px-3 py-3 text-[15px] transition-colors ${
                active
                  ? "bg-white/[0.06] text-sx-text"
                  : "text-sx-faint hover:bg-white/[0.03] hover:text-sx-muted"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span className="truncate">{label}</span>}
            </a>
          ))}
        </nav>

        {/* Bas de sidebar */}
        <div className="mt-auto px-3 pb-5">
          <div className="space-y-1 px-1 pb-3">
            <a
              href={`${SUITE}/gerer-mon-compte`}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sx-text hover:opacity-80"
            >
              <IconGear className="h-[18px] w-[18px]" />
              {open && <span>Gérer mon compte</span>}
            </a>
            <a
              href={`${SUITE}/formation-offerte#tally-open=rjDOMR&tally-layout=modal&tally-hide-title=1&tally-emoji-text=%F0%9F%91%8B&tally-emoji-animation=wave`}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sx-text hover:opacity-80"
            >
              <IconBulb className="h-[18px] w-[18px]" />
              {open && <span>Faire une suggestion</span>}
            </a>
          </div>
          <a
            href={`${SUITE}/deconnexion`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sx-blue px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sx-blue/20 transition-colors hover:bg-[#2569d6]"
          >
            <IconLogout className="h-[18px] w-[18px]" />
            {open && <span>Déconnexion</span>}
          </a>
        </div>
      </div>

      {/* Bouton repli */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Replier le menu" : "Déplier le menu"}
        className="absolute -right-1 top-1/2 z-10 flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg bg-sx-panel text-sx-faint ring-1 ring-white/5 hover:text-sx-muted"
      >
        <IconChevron className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
