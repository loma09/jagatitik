import Link from "next/link";
import MapView from "@/components/map/MapView";

export const metadata = { title: "Heatmap laporan — Jaga Titik" };

export default function PetaPage() {
  return (
    <section className="heatmap-page page-gutter">
      <div className="heatmap-intro">
        <div><h1>Kenali sekitar lewat laporan warga</h1><p>Jelajahi sebaran laporan di Jabodetabek. Warna yang lebih hangat menunjukkan kepadatan berbobot laporan yang lebih tinggi.</p></div>
        <Link href="/lapor" prefetch={false} className="action-primary">Buat laporan <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="heatmap-toolbar">
        <span className="demo-tag">Data demo: simulasi</span>
        <div className="heatmap-legend" role="img" aria-label="Intensitas laporan dari rendah, biru, hingga tinggi, merah"><span>Rendah</span><span className="heatmap-scale" /><span>Tinggi</span></div>
      </div>
      <MapView />
      <p className="heatmap-disclaimer">Heatmap memakai bobot kepercayaan dan peluruhan waktu laporan. Warna bukan jaminan keamanan atau penilaian suatu wilayah. Tidak adanya laporan bukan berarti tidak ada kejadian.</p>
    </section>
  );
}
