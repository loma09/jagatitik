"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const stages = [
  { id: "reported", label: "Dilaporkan", date: "18 Oktober 2026", color: "#916110", title: "Warga menandai titik", description: "Lampu di jalur pejalan kaki belum menyala. Laporan dari dua akun berbeda membuat titik ini dapat dilihat publik.", note: "Menunggu peninjauan instansi", count: "2 pelapor", time: "18 Okt", action: "Laporan warga tercatat" },
  { id: "progress", label: "Ditindaklanjuti", date: "19 Oktober 2026", color: "#285d86", title: "Respons jadi catatan", description: "Instansi memeriksa laporan dan mencatat rencana tindakan. Warga bisa melihat perkembangan titik yang sama.", note: "Pemeriksaan lampu dijadwalkan", count: "2 pelapor", time: "19 Okt", action: "Petugas meninjau lokasi" },
  { id: "resolved", label: "Selesai", date: "21 Oktober 2026", color: "#326c50", title: "Tindakan bisa ditelusuri", description: "Perbaikan dicatat dalam riwayat publik. Status selesai tetap menyimpan perjalanan laporan dari awal.", note: "Lampu diperbaiki dan kembali menyala", count: "2 pelapor", time: "21 Okt", action: "Perbaikan lampu dicatat" },
] as const;

function DemoMap({ stage }: { stage: number }) {
  const container = useRef<HTMLDivElement>(null);
  const marker = useRef<CircleMarker | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    let resize: ResizeObserver | null = null;

    import("leaflet").then((module) => {
      if (disposed || !container.current) return;
      const L = module.default;
      map = L.map(container.current, {
        zoomControl: false, scrollWheelZoom: false, dragging: false,
        doubleClickZoom: false, touchZoom: false, keyboard: false,
        boxZoom: false, attributionControl: false,
      }).setView([-6.248, 106.811], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      const examples: [number, number][] = [[-6.213, 106.782], [-6.218, 106.853], [-6.274, 106.753], [-6.292, 106.845], [-6.231, 106.89]];
      examples.forEach((point) => L.circleMarker(point, { radius: 6, color: "#ffffff", weight: 3, fillColor: "#1a2a4a", fillOpacity: 1 }).addTo(map!));
      marker.current = L.circleMarker([-6.248, 106.811], { radius: 11, color: "#ffffff", weight: 5, fillColor: stages[0].color, fillOpacity: 1 }).addTo(map);
      resize = new ResizeObserver(() => map?.invalidateSize());
      resize.observe(container.current);
    }).catch(() => { if (!disposed) setUnavailable(true); });

    return () => { disposed = true; resize?.disconnect(); map?.remove(); marker.current = null; };
  }, []);

  useEffect(() => { marker.current?.setStyle({ fillColor: stages[stage].color }); }, [stage]);

  return (
    <>
      <div ref={container} className="story-map" aria-label="Peta dasar Jakarta Selatan dengan penanda contoh simulasi" />
      {unavailable && <p className="map-unavailable">Pratinjau peta belum termuat. Riwayat contoh tetap bisa dibaca di bawah.</p>}
    </>
  );
}

export default function ReportStory() {
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  return (
    <div className="story-split">
      <div className="story-reading">
        <section className="landing-hero" aria-labelledby="landing-title">
          <h1 id="landing-title"><span className="headline-line"><span className="reveal">Jaga titik.</span></span><span className="headline-line"><span className="reveal">Pantau aksinya.</span></span></h1>
          <p className="hero-description reveal">Jaga Titik menghubungkan laporan titik rawan dengan tindak lanjut yang bisa dipantau bersama.</p>
          <div className="hero-actions reveal">
            <Link href="/peta" className="action-primary hero-action">Jelajahi peta <span aria-hidden="true">↗</span></Link>
            <a href="#cara-kerja" className="text-link">Lihat cara kerjanya</a>
          </div>
          <div className="hero-context reveal">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/></svg>
            <p>Dimulai dari Jabodetabek.<br /><span>Dirawat lewat kepedulian bersama.</span></p>
          </div>
        </section>

        <section id="cara-kerja" className="story-steps" aria-labelledby="story-title">
          <h2 id="story-title" className="reveal">Laporan punya kelanjutan</h2>
          <p className="section-description reveal">Satu titik, satu riwayat yang terbuka. Pilih tahapan untuk mengikuti contoh laporannya.</p>
          <div className="stage-buttons" aria-label="Tahapan contoh laporan">
            {stages.map((item, index) => (
              <button key={item.id} type="button" className="stage-button reveal" data-stage-button={item.id} aria-pressed={stage === index} onClick={() => setStage(index)}>
                <span className="stage-dot" aria-hidden="true" />
                <span><span className="stage-label">{item.label}</span><span className="stage-description">{item.title}</span></span>
                <span className="stage-indicator" aria-hidden="true">{stage === index ? <svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="1.5" /></svg> : "+"}</span>
              </button>
            ))}
          </div>
          <p className="demo-caption">Seluruh contoh ini adalah simulasi, bukan laporan kejadian nyata.</p>
        </section>
      </div>

      <div className="story-visual reveal">
        <div className="map-stage" data-ui="map-preview">
          <DemoMap stage={stage} />
          <div className="map-heading"><span>Jakarta Selatan</span><span className="demo-tag">Simulasi</span></div>
          <div className="map-point-label"><span className="point-marker" aria-hidden="true" />Titik yang kita jaga</div>
          <div className="map-record" data-stage-preview={current.id} aria-live="polite" aria-atomic="true">
            <div className="record-top"><span>Area gelap / sepi</span><span className={`status-chip status-${current.id}`}>{current.label}</span></div>
            <p className="record-name">Lampu jalan belum menyala</p>
            <p className="record-location">Titik contoh di Jakarta Selatan</p>
            <div key={current.id} className="record-change">
              <p className="record-note">{current.note}</p>
              <div className="record-meta"><span>{current.count}</span><span>{current.date}</span></div>
            </div>
          </div>
          <a className="map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
        </div>
      </div>
      <div className="story-mobile-detail" aria-live="polite"><p>{current.description}</p></div>
    </div>
  );
}
