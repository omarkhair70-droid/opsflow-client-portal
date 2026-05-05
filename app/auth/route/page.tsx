import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AuthRoutePage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) redirect("/login");

  const { data: orgMembership } = await supabase
    .from("organization_members")
    .select("organization:organizations(slug)")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (orgMembership?.organization?.slug) redirect(`/app/${orgMembership.organization.slug}/dashboard`);

  const { data: clientMembership } = await supabase
    .from("client_members")
    .select("organization:organizations(slug)")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (clientMembership?.organization?.slug) redirect(`/portal/${clientMembership.organization.slug}/dashboard`);

  redirect("/onboarding");
}
