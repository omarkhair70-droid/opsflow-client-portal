import { notFound, redirect } from "next/navigation";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REQUEST_PRIORITIES, REQUEST_PRIORITY_LABELS, REQUEST_STATUSES, REQUEST_STATUS_LABELS } from "@/lib/requests";

async function updateRequest(formData: FormData) {
  "use server";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");

  if (!REQUEST_STATUSES.includes(status as any) || !REQUEST_PRIORITIES.includes(priority as any)) return;

  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  const { data: existing } = await supabase
    .from("requests")
    .select("id, triaged_at")
    .eq("organization_id", org.id)
    .eq("id", requestId)
    .maybeSingle();

  if (!existing) return;

  const updates: any = { status, priority };
  if (!existing.triaged_at && status !== "submitted") {
    updates.triaged_by_user_id = userId;
    updates.triaged_at = new Date().toISOString();
  }

  await supabase.from("requests").update(updates).eq("id", requestId).eq("organization_id", org.id);

  redirect(`/app/${orgSlug}/requests/${requestId}`);
}

export default async function InternalRequestDetail({ params }: { params: Promise<{ orgSlug: string; requestId: string }> }) {
  const { orgSlug, requestId } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const [{ data: request }, { data: events }] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, description, status, priority, created_at, triaged_at, clients!inner(name), submitted_by:profiles!requests_submitted_by_user_id_fkey(email), triaged_by:profiles!requests_triaged_by_user_id_fkey(email)")
      .eq("organization_id", org.id)
      .eq("id", requestId)
      .maybeSingle(),
    supabase
      .from("activity_events")
      .select("id, action, metadata_json, occurred_at")
      .eq("organization_id", org.id)
      .eq("entity_type", "request")
      .eq("entity_id", requestId)
      .order("occurred_at", { ascending: false }),
  ]);

  if (!request) notFound();

  return (
    <main className="p-8 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">{request.title}</h1>
        <p className="mt-2 text-slate-300">{request.description || "No description provided."}</p>
        <p className="mt-2">Client: {(request.clients as any).name}</p>
        <p>Status: {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]}</p>
        <p>Priority: {REQUEST_PRIORITY_LABELS[request.priority as keyof typeof REQUEST_PRIORITY_LABELS]}</p>
        <p>Submitted by: {(request.submitted_by as any)?.email ?? "Unknown"}</p>
        <p>Created: {new Date(request.created_at).toLocaleString()}</p>
        {request.triaged_at ? <p>Triaged by: {(request.triaged_by as any)?.email ?? "Unknown"} at {new Date(request.triaged_at).toLocaleString()}</p> : null}
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Update Triage</h2>
        <form action={updateRequest} className="space-y-3 max-w-md">
          <input type="hidden" name="orgSlug" value={org.slug} />
          <input type="hidden" name="requestId" value={request.id} />
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select name="status" defaultValue={request.status} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
              {REQUEST_STATUSES.map((status) => <option key={status} value={status}>{REQUEST_STATUS_LABELS[status]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select name="priority" defaultValue={request.priority} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
              {REQUEST_PRIORITIES.map((priority) => <option key={priority} value={priority}>{REQUEST_PRIORITY_LABELS[priority]}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2">Save Changes</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Activity</h2>
        <ul className="space-y-2">
          {(events ?? []).map((event: any) => (
            <li key={event.id} className="rounded border border-slate-700 p-3">
              <p className="font-medium">{event.action}</p>
              <p className="text-sm text-slate-300">{JSON.stringify(event.metadata_json)}</p>
              <p className="text-sm text-slate-400">{new Date(event.occurred_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
