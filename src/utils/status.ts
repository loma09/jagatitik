import type { SpotCategory, SpotStatus } from "@/types/spot";

export const STATUS_LABEL: Record<SpotStatus, string> = {
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  in_progress: "Sedang ditindaklanjuti",
  resolved: "Selesai ditangani",
  rejected: "Ditolak",
};

export const STATUS_COLOR: Record<SpotStatus, string> = {
  pending: "#f59e0b",
  verified: "#ef4444",
  in_progress: "#3b82f6",
  resolved: "#22c55e",
  rejected: "#9ca3af",
};

export const CATEGORY_LABEL: Record<SpotCategory, string> = {
  begal: "Begal / jalan rawan",
  copet: "Copet",
  pelecehan: "Pelecehan di ruang publik",
  area_gelap: "Area gelap / sepi",
};
