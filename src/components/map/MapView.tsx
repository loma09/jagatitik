"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { getPublicSpots } from "@/services/spots";
import { isSupabaseConfigured } from "@/services/supabase/client";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/utils/constants";
import { hasDrawableMapSize, heatmapStyleForZoom, toHeatmapPoints } from "@/utils/heatmap";

type Props = { onLocationChange?: (location: [number, number]) => void };

export default function MapView({ onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onLocationRef = useRef(onLocationChange);
  const [loadError, setLoadError] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spotCount, setSpotCount] = useState<number | null>(null);
  const [mapError, setMapError] = useState(false);
  const selectingLocation = Boolean(onLocationChange);

  useEffect(() => { onLocationRef.current = onLocationChange; }, [onLocationChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let started = false;
    let cancelHeatmapFrame: (() => void) | undefined;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let marker: import("leaflet").Marker | null = null;
    let removeKeyboardListener: (() => void) | undefined;

    const initialize = async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled) return;
        if (!hasDrawableMapSize(container.clientWidth, container.clientHeight)) { started = false; return; }
        map = L.map(container, { trackResize: false }).setView(DEFAULT_CENTER, selectingLocation ? DEFAULT_ZOOM : 12);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).on("tileerror", () => { if (!cancelled) setTileError(true); }).addTo(map);

        if (selectingLocation) {
          const placeMarker = (lat: number, lng: number) => {
            if (!map) return;
            if (marker) marker.setLatLng([lat, lng]);
            else {
              marker = L.marker([lat, lng], {
                draggable: true,
                title: "Lokasi laporan; geser untuk mengubah",
                icon: L.divIcon({ className: "report-location-pin", html: '<span aria-hidden="true"></span>', iconSize: [32, 40], iconAnchor: [16, 40] }),
              }).addTo(map);
              marker.on("dragend", () => {
                if (!marker) return;
                const position = marker.getLatLng();
                onLocationRef.current?.([position.lat, position.lng]);
              });
            }
            onLocationRef.current?.([lat, lng]);
          };
          map.on("click", (event: import("leaflet").LeafletMouseEvent) => placeMarker(event.latlng.lat, event.latlng.lng));
          // Keyboard users can move the map with arrows and select its center with Enter.
          const selectCenter = (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.target !== containerRef.current || !map) return;
            event.preventDefault();
            const center = map.getCenter();
            placeMarker(center.lat, center.lng);
          };
          container.addEventListener("keydown", selectCenter);
          removeKeyboardListener = () => container.removeEventListener("keydown", selectCenter);
          setLoading(false);
          return;
        }

        if (!isSupabaseConfigured()) { setLoading(false); return; }
        try {
          const spots = await getPublicSpots();
          if (cancelled || !map) return;
          const points = toHeatmapPoints(spots);
          await import("leaflet.heat");
          if (cancelled || !map) return;
          const heat = L.heatLayer(points, {
            ...heatmapStyleForZoom(map.getZoom()),
            maxZoom: map.getZoom(), max: 3, minOpacity: 0.35,
            gradient: { 0.25: "#2c7bb6", 0.5: "#41b6c4", 0.7: "#f9d057", 0.85: "#f79043", 1: "#d73027" },
          });
          heat.addTo(map);
          const updateHeatmap = () => {
            if (!map || cancelled) return;
            heat.setOptions({ ...heatmapStyleForZoom(map.getZoom()), maxZoom: map.getZoom() });
          };
          map.on("zoomend", updateHeatmap);
          // Leaflet.heat does not cancel its queued canvas frame when the layer is removed.
          cancelHeatmapFrame = () => {
            const pending = (heat as typeof heat & { _frame?: number })._frame;
            if (pending !== undefined) L.Util.cancelAnimFrame(pending);
          };
          setSpotCount(points.length);
        } catch {
          if (!cancelled) setLoadError(true);
        }
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) { setMapError(true); setLoading(false); }
      }
    };
    // A hidden container must not resize Leaflet's canvas to 0 × 0.
    // Observe it ourselves instead of Leaflet's unguarded window resize handler.
    resizeObserver = new ResizeObserver(() => {
      if (cancelled || !hasDrawableMapSize(container.clientWidth, container.clientHeight)) return;
      if (map) map.invalidateSize({ pan: false });
      else if (!started) { started = true; void initialize(); }
    });
    resizeObserver.observe(container);

    return () => { cancelled = true; removeKeyboardListener?.(); resizeObserver?.disconnect(); cancelHeatmapFrame?.(); map?.remove(); };
  }, [selectingLocation]);

  return (
    <div className="heatmap-view">
      <div className="map-feedback" role="status" aria-live="polite">
        {loading && <p>Memuat {selectingLocation ? "peta lokasi" : "heatmap laporan"}…</p>}
        {!selectingLocation && !isSupabaseConfigured() && <p>Data laporan belum tersedia. Peta dasar tetap bisa dijelajahi.</p>}
        {loadError && <p>Data heatmap belum berhasil dimuat. Coba muat ulang halaman.</p>}
        {mapError && <p>Peta belum berhasil dimuat. Coba muat ulang halaman.</p>}
        {tileError && <p>Sebagian peta dasar gagal dimuat. Periksa koneksi internet.</p>}
        {spotCount === 0 && <p>Belum ada laporan yang dapat ditampilkan pada heatmap.</p>}
        {spotCount !== null && spotCount > 0 && <p>{spotCount} lokasi laporan tersedia.</p>}
      </div>
      <div ref={containerRef} className={`interactive-map ${selectingLocation ? "location-picker-map" : "public-heatmap"}`} role="region" aria-label={selectingLocation ? "Pilih lokasi laporan. Klik peta atau geser dengan tombol panah lalu tekan Enter." : "Heatmap kepadatan laporan warga"} />
    </div>
  );
}
