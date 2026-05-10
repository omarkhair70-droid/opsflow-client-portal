import { notFound } from "next/navigation";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REQUEST_STATUS_LABELS } from "@/lib/requests";

export default async function PortalRequestDetail({ params }: { params: Promise<{ orgSlug: string; requestId: string }> }) {
  const { orgSlug, requestId } = await params;
  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const { data: request } = await supabase
    .from("requests")
    .select("id, title, description, status, created_at")
    .eq("organization_id", org.id)
    .eq("id", requestId)
    .maybeSingle();

  if (!request) notFound();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">{request.title}</h1>
      <p className="text-slate-300">{request.description || "No description provided."}</p>
      <p>Status: {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]}</p>
      <p>Created: {new Date(request.created_at).toLocaleString()}</p>
    </main>
  );
}
