export type SpotStatus = "pending" | "verified" | "in_progress" | "resolved" | "rejected";
export type SpotCategory = "begal" | "copet" | "pelecehan" | "area_gelap";

// Bentuk baris dari view public_spots (tanpa user_id & isi deskripsi).
export interface PublicSpot {
  id: number;
  lat: number;
  lng: number;
  category: SpotCategory;
  status: SpotStatus;
  region_id: number | null;
  reporter_count: number;
  confirm_count: number;
  weight: number;
  first_reported_at: string;
  last_update_at: string | null;
}
