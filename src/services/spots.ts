import { getSupabase } from "@/services/supabase/client";
import type { PublicSpot } from "@/types/spot";

// Membaca titik yang sudah tayang publik (view public_spots).
export async function getPublicSpots(): Promise<PublicSpot[]> {
  const { data, error } = await getSupabase().from("public_spots").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicSpot[];
}
