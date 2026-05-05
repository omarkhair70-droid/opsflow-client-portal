import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireInternalOrgAccess(orgSlug: string) {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data } = await supabase
    .from("organization_members")
    .select("id, organization:organizations!inner(slug,name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("organization.slug", orgSlug)
    .limit(1)
    .maybeSingle();

  if (!data) redirect("/forbidden");
  return data.organization;
}

export async function requirePortalOrgAccess(orgSlug: string) {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data } = await supabase
    .from("client_members")
    .select("id, client:clients!inner(id,organization:organizations!inner(slug,name))")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("client.organization.slug", orgSlug)
    .limit(1)
    .maybeSingle();

  if (!data) redirect("/forbidden");
  return data.client.organization;
}
