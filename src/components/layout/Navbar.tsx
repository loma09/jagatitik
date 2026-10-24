import Link from "next/link";
import { APP_NAME, EMERGENCY_NUMBER } from "@/utils/constants";

const links = [
  { href: "/peta", label: "Peta" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/metodologi", label: "Metodologi" },
  { href: "/lapor", label: "Lapor" },
];

export default function Navbar() {
  return (
    <header className="bg-brand text-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-accent">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/darurat"
              className="rounded bg-red-600 px-3 py-1.5 font-semibold hover:bg-red-700"
            >
              Darurat {EMERGENCY_NUMBER}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
