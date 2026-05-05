import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}
