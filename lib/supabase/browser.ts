import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}
