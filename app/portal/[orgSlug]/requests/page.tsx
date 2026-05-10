import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REQUEST_STATUS_LABELS } from "@/lib/requests";

async function createRequest(formData: FormData) {
  "use server";

  const orgSlug = String(formData.get("orgSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "");

  if (!orgSlug || !title || !clientId) return;

  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data, error } = await supabase
    .from("requests")
    .insert({
      organization_id: org.id,
      client_id: clientId,
      title,
      description: description || null,
      submitted_by_user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) return;

  redirect(`/portal/${orgSlug}/requests/${data.id}`);
}

export default async function PortalRequestsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const [{ data: clientMemberships }, { data: requests }] = await Promise.all([
    supabase
      .from("client_members")
      .select("client_id, clients!inner(id, name, organization_id)")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("clients.organization_id", org.id),
    supabase
      .from("requests")
      .select("id, title, status, created_at")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false }),
  ]);

  const clients = (clientMemberships ?? []).map((row: any) => row.clients);

  return (
    <main className="p-8 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="mt-2 text-slate-300">Organization: {org.slug} ({org.name})</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Submit New Request</h2>
        <form action={createRequest} className="space-y-3 max-w-xl">
          <input type="hidden" name="orgSlug" value={org.slug} />
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input name="title" required className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" rows={4} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
          </div>
          {clients.length > 1 ? (
            <div>
              <label className="block text-sm mb-1">Client</label>
              <select name="clientId" required className="w-full rounded border border-slate-600 bg-slate-900 p-2">
                {clients.map((client: any) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
          ) : (
            <input type="hidden" name="clientId" value={clients[0]?.id ?? ""} />
          )}
          <button type="submit" className="rounded bg-blue-600 px-4 py-2">Submit Request</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Your Requests</h2>
        <ul className="space-y-2">
          {(requests ?? []).map((request: any) => (
            <li key={request.id} className="rounded border border-slate-700 p-3">
              <Link href={`/portal/${org.slug}/requests/${request.id}`} className="font-medium hover:underline">{request.title}</Link>
              <p className="text-sm text-slate-300">{REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]} · {new Date(request.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
