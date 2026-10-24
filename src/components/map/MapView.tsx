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

  useEffect(() => {
    if (!configured || !containerRef.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

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
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Gagal memuat data titik.");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [configured]);

  const message = configured ? loadError : "Supabase belum dikonfigurasi. Isi .env.local lalu jalankan ulang.";

  return (
    <div>
      {message && (
        <p className="mb-3 rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">{message}</p>
      )}
      <div ref={containerRef} className="h-[70vh] w-full rounded-lg border border-slate-300" />
    </div>
  );
}
