import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LABELS,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
} from "@/lib/requests";
import { TASK_STATUS_LABELS } from "@/lib/tasks";

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

async function createTask(formData: FormData) {
  "use server";

  const orgSlug = String(formData.get("orgSlug") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignedTo = String(formData.get("assigned_to_user_id") ?? "");
  const dueAt = String(formData.get("due_at") ?? "");

  if (!title) return;

  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  await supabase.from("tasks").insert({
    organization_id: org.id,
    request_id: requestId,
    title,
    description: description || null,
    assigned_to_user_id: assignedTo || null,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    created_by_user_id: userId,
  });

  redirect(`/app/${orgSlug}/requests/${requestId}`);
}

export default async function InternalRequestDetail({
  params,
}: {
  params: Promise<{ orgSlug: string; requestId: string }>;
}) {
  const { orgSlug, requestId } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const [{ data: request }, { data: events }, { data: members }, { data: tasks }] = await Promise.all([
    supabase
      .from("requests")
      .select(
        "id, title, description, status, priority, created_at, triaged_at, clients!inner(name), submitted_by:profiles!requests_submitted_by_user_id_fkey(email), triaged_by:profiles!requests_triaged_by_user_id_fkey(email)",
      )
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
    supabase
      .from("organization_members")
      .select("user_id, profiles!inner(email)")
      .eq("organization_id", org.id)
      .eq("status", "active"),
    supabase
      .from("tasks")
      .select("id, title, status, due_at, assignee:profiles!tasks_assigned_to_user_id_fkey(email)")
      .eq("organization_id", org.id)
      .eq("request_id", requestId)
      .order("created_at", { ascending: false }),
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
        {request.triaged_at ? (
          <p>
            Triaged by: {(request.triaged_by as any)?.email ?? "Unknown"} at {new Date(request.triaged_at).toLocaleString()}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Update Triage</h2>
        <form action={updateRequest} className="space-y-3 max-w-md">
          <input type="hidden" name="orgSlug" value={org.slug} />
          <input type="hidden" name="requestId" value={request.id} />

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select name="status" defaultValue={request.status} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
              {REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {REQUEST_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select name="priority" defaultValue={request.priority} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
              {REQUEST_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {REQUEST_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="rounded bg-blue-600 px-4 py-2">Save Changes</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Internal Execution</h2>
        <form action={createTask} className="space-y-3 max-w-md mb-4">
          <input type="hidden" name="orgSlug" value={org.slug} />
          <input type="hidden" name="requestId" value={request.id} />
          <input name="title" placeholder="Task title" className="w-full rounded border border-slate-600 bg-slate-900 p-2" required />
          <textarea name="description" placeholder="Description" className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
          <select name="assigned_to_user_id" defaultValue="" className="w-full rounded border border-slate-600 bg-slate-900 p-2">
            <option value="">Unassigned</option>
            {(members ?? []).map((member: any) => (
              <option key={member.user_id} value={member.user_id}>
                {(member.profiles as any).email}
              </option>
            ))}
          </select>
          <input name="due_at" type="datetime-local" className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
          <button type="submit" className="rounded bg-blue-600 px-4 py-2">Create Task</button>
        </form>

        <ul className="space-y-2">
          {(tasks ?? []).map((task: any) => (
            <li key={task.id} className="rounded border border-slate-700 p-3">
              <p className="font-medium">
                <Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/tasks/${task.id}`}>
                  {task.title}
                </Link>
              </p>
              <p className="text-sm">Status: {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}</p>
              <p className="text-sm">Assignee: {(task.assignee as any)?.email ?? "Unassigned"}</p>
              <p className="text-sm">Due: {task.due_at ? new Date(task.due_at).toLocaleString() : "No due date"}</p>
            </li>
          ))}
        </ul>
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
