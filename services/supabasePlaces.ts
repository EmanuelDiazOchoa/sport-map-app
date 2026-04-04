import { supabase } from "../lib/supabase";
import { Place } from "../types/place";

export async function fetchPlaces(): Promise<Place[]> {
  const { data, error } = await supabase.from("places").select("*");

  if (error) {
    console.error("Error fetching places:", error.message);
    return [];
  }

  return data as Place[];
}
