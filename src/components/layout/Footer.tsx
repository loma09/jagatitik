import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-slate-600">
        <p>Jaga Titik — karya WIA MIA 2026. Data pada versi demo adalah data simulasi.</p>
        <Link href="/privasi" className="underline">
          Kebijakan Privasi
        </Link>
      </div>
    </footer>
  );
}
