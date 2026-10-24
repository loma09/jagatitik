"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { getPublicSpots } from "@/services/spots";
import { isSupabaseConfigured } from "@/services/supabase/client";
import { CATEGORY_LABEL, STATUS_COLOR, STATUS_LABEL } from "@/utils/status";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/utils/constants";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const configured = isSupabaseConfigured();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tileError, setTileError] = useState(false);
  const [spotCount, setSpotCount] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      // Peta dasar SELALU dibuat, walau Supabase belum siap, agar tidak tampil kotak kosong.
      map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      tiles.on("tileerror", () => {
        if (!cancelled) setTileError(true);
      });
      // Pastikan ukuran dihitung ulang setelah layout selesai.
      setTimeout(() => map?.invalidateSize(), 250);

      if (!isSupabaseConfigured()) return;

      try {
        const spots = await getPublicSpots();
        if (cancelled || !map) return;
        for (const s of spots) {
          const popup = document.createElement("div");
          const title = document.createElement("strong");
          title.textContent = CATEGORY_LABEL[s.category];
          const info = document.createElement("div");
          info.textContent = `${STATUS_LABEL[s.status]} · ${s.reporter_count} pelapor`;
          popup.append(title, info);

          L.circleMarker([s.lat, s.lng], {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: STATUS_COLOR[s.status],
            fillOpacity: 0.9,
          })
            .bindPopup(popup)
            .addTo(map);
        }
        setSpotCount(spots.length);
      } catch (e) {
        console.error("Gagal memuat titik:", e);
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Gagal memuat data titik.");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  const notes: string[] = [];
  if (!configured) notes.push("Supabase belum dikonfigurasi: isi .env.local lalu restart npm run dev.");
  if (loadError) notes.push(`Data titik gagal dimuat: ${loadError}`);
  if (tileError) notes.push("Ubin peta gagal dimuat: periksa koneksi internet atau pemblokir iklan.");
  if (spotCount === 0) notes.push("Tidak ada titik publik. Jalankan 02_seed_demo.sql di Supabase.");

  return (
    <div>
      {notes.map((n) => (
        <p key={n} className="mb-2 rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">
          {n}
        </p>
      ))}
      {spotCount !== null && spotCount > 0 && (
        <p className="mb-2 text-sm text-slate-600">{spotCount} titik ditampilkan.</p>
      )}
      <div ref={containerRef} className="h-[70vh] w-full rounded-lg border border-slate-300 bg-slate-100" />
    </div>
  );
}