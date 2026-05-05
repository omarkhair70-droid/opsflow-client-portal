import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OrgAccessContext = {
  id: string;
  slug: string;
  name: string;
};

export async function requireInternalOrgAccess(orgSlug: string): Promise<OrgAccessContext> {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data } = await supabase
    .from("organizations")
    .select("id, slug, name, members:organization_members!inner(user_id,status)")
    .eq("slug", orgSlug)
    .eq("members.user_id", userId)
    .eq("members.status", "active")
    .maybeSingle();

  if (!data) redirect("/forbidden");

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
  };
}

export async function requirePortalOrgAccess(orgSlug: string): Promise<OrgAccessContext> {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data } = await supabase
    .from("organizations")
    .select(
      "id, slug, name, clients:clients!inner(members:client_members!inner(user_id,status))",
    )
    .eq("slug", orgSlug)
    .eq("clients.members.user_id", userId)
    .eq("clients.members.status", "active")
    .maybeSingle();

  if (!data) redirect("/forbidden");

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
  };
}
