import { getSupabase } from "@/services/supabase/client";
import type { PublicSpot } from "@/types/spot";

// Peta publik hanya membutuhkan lokasi dan bobot; status tetap menjadi urusan admin.
export async function getPublicSpots(): Promise<Pick<PublicSpot, "lat" | "lng" | "weight">[]> {
  const { data, error } = await getSupabase().from("public_spots").select("lat,lng,weight");
  if (error) throw new Error(error.message);
  return data ?? [];
}
