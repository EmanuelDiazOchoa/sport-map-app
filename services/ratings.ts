import { supabase } from "../lib/supabase";

export async function getUserRating(placeId: string): Promise<number | null> {
  const { data } = await supabase
    .from("ratings")
    .select("rating")
    .eq("place_id", placeId)
    .maybeSingle();
  return data?.rating ?? null;
}

export async function getPlaceAvgRating(
  placeId: string,
): Promise<{ avg: number; count: number } | null> {
  const { data } = await supabase
    .from("ratings")
    .select("rating")
    .eq("place_id", placeId);
  if (!data || data.length === 0) return null;
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return { avg: Math.round(avg * 10) / 10, count: data.length };
}

export async function submitRating(
  placeId: string,
  rating: number,
): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return false;

  const { error } = await supabase.from("ratings").upsert(
    {
      user_id: session.session.user.id,
      place_id: placeId,
      rating,
    },
    { onConflict: "user_id,place_id" },
  );

  return !error;
}
