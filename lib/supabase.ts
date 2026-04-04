import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fomqklsdmgsdluocbrdz.supabase.co";
const SUPABASE_KEY = "sb_publishable_duyFkupW9yVrWccP2y1kCg_iCRymiFw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
