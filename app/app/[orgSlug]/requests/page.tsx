import Link from "next/link";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REQUEST_PRIORITY_LABELS, REQUEST_STATUS_LABELS } from "@/lib/requests";

export default async function InternalRequestsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, status, priority, created_at, clients!inner(name)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Requests</h1>
      <p className="text-slate-300">Organization: {org.slug} ({org.name})</p>
      <ul className="space-y-2">
        {(requests ?? []).map((request: any) => (
          <li key={request.id} className="rounded border border-slate-700 p-3">
            <Link href={`/app/${org.slug}/requests/${request.id}`} className="font-medium hover:underline">{request.title}</Link>
            <p className="text-sm text-slate-300">{request.clients.name} · {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]} · {REQUEST_PRIORITY_LABELS[request.priority as keyof typeof REQUEST_PRIORITY_LABELS]} · {new Date(request.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
