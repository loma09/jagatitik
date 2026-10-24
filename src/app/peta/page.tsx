import MapView from "@/components/map/MapView";
import { STATUS_COLOR, STATUS_LABEL } from "@/utils/status";
import type { SpotStatus } from "@/types/spot";

export const metadata = { title: "Peta titik rawan — Jaga Titik" };

const legend: SpotStatus[] = ["pending", "verified", "in_progress", "resolved"];

export default function PetaPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand">Peta titik rawan</h1>
      <p className="mt-1 mb-4 text-slate-600">
        Hanya titik yang sudah memenuhi aturan tayang yang ditampilkan. Data pada versi demo adalah simulasi.
      </p>
      <ul className="mb-4 flex flex-wrap gap-4 text-sm">
        {legend.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
            {STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
      <MapView />
    </section>
  );
}
