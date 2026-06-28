import { Logo } from "./Logo";

/** Barre supérieure : logo S'investir Simulateurs + lien "Découvrir S'investir". */
export function Topbar() {
  return (
    <header className="border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <a
          href="https://sinvestir.fr"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-sx-text transition-opacity hover:opacity-80"
        >
          Découvrir S&rsquo;investir
        </a>
      </div>
    </header>
  );
}
