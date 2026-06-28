import Image from "next/image";

/** Logo officiel S'investir Simulateurs. */
export function Logo() {
  return (
    <Image
      src="/logo-simulateurs.png"
      alt="S'investir Simulateurs"
      width={528}
      height={168}
      priority
      className="h-16 w-auto sm:h-[72px]"
    />
  );
}
