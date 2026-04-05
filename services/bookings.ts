import { supabase } from "../lib/supabase";

export type Booking = {
  id: string;
  place_id: string;
  place_name: string;
  place_type: string;
  date: string;
  time_slot: string;
  status: "confirmed" | "cancelled";
  created_at: string;
};

export async function createBooking(booking: {
  place_id: string;
  place_name: string;
  place_type: string;
  date: string;
  time_slot: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session)
    return { success: false, error: "Debés iniciar sesión para reservar." };

  const { error } = await supabase.from("bookings").insert({
    ...booking,
    user_id: session.session.user.id,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: true });

  if (error) return [];
  return data as Booking[];
}

export async function cancelBooking(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);
  return !error;
}
