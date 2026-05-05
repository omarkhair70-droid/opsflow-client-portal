import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getOrganizationById(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, organizationId: string) {
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("id", organizationId)
    .maybeSingle();

  return organization;
}

export default async function AuthRoutePage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) redirect("/login");

  const { data: orgMembership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (orgMembership?.organization_id) {
    const organization = await getOrganizationById(supabase, orgMembership.organization_id);
    if (organization?.slug) redirect(`/app/${organization.slug}/dashboard`);
  }

  const { data: clientMembership } = await supabase
    .from("client_members")
    .select("organization_id, client_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (clientMembership?.organization_id) {
    const organization = await getOrganizationById(supabase, clientMembership.organization_id);
    if (organization?.slug) redirect(`/portal/${organization.slug}/dashboard`);
  }

  redirect("/onboarding");
}
