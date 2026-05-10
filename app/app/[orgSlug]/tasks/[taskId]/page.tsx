import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/tasks";

async function updateTask(formData: FormData) {
  "use server";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "");
  const assignedTo = String(formData.get("assigned_to_user_id") ?? "");
  const dueAt = String(formData.get("due_at") ?? "");
  if (!TASK_STATUSES.includes(status as any)) return;

  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const updates: any = { status, assigned_to_user_id: assignedTo || null, due_at: dueAt ? new Date(dueAt).toISOString() : null };
  await supabase.from("tasks").update(updates).eq("id", taskId).eq("organization_id", org.id);

  redirect(`/app/${orgSlug}/tasks/${taskId}`);
}

export default async function TaskDetailPage({ params }: { params: Promise<{ orgSlug: string; taskId: string }> }) {
  const { orgSlug, taskId } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const [{ data: task }, { data: members }, { data: events }] = await Promise.all([
    supabase.from("tasks").select("id,title,description,status,due_at,completed_at,created_at,request_id,assigned_to_user_id,requests!inner(id,title),assignee:profiles!tasks_assigned_to_user_id_fkey(email),created_by:profiles!tasks_created_by_user_id_fkey(email)").eq("organization_id", org.id).eq("id", taskId).maybeSingle(),
    supabase.from("organization_members").select("user_id, profiles!inner(email)").eq("organization_id", org.id).eq("status", "active"),
    supabase.from("activity_events").select("id,action,metadata_json,occurred_at").eq("organization_id", org.id).eq("entity_type", "task").eq("entity_id", taskId).order("occurred_at", { ascending: false }),
  ]);

  if (!task) notFound();

  return <main className="p-8 space-y-6">
    <section>
      <h1 className="text-2xl font-semibold">{task.title}</h1>
      <p className="mt-2 text-slate-300">{task.description || "No description provided."}</p>
      <p>Request: <Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/requests/${(task.requests as any).id}`}>{(task.requests as any).title}</Link></p>
      <p>Status: {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}</p>
      <p>Assignee: {(task.assignee as any)?.email ?? "Unassigned"}</p>
      <p>Due: {task.due_at ? new Date(task.due_at).toLocaleString() : "No due date"}</p>
      {task.completed_at ? <p>Completed: {new Date(task.completed_at).toLocaleString()}</p> : null}
      <p>Created by: {(task.created_by as any)?.email ?? "Unknown"}</p>
      <p>Created: {new Date(task.created_at).toLocaleString()}</p>
    </section>

    <section>
      <h2 className="text-xl font-medium mb-2">Update Task</h2>
      <form action={updateTask} className="space-y-3 max-w-md">
        <input type="hidden" name="orgSlug" value={org.slug} />
        <input type="hidden" name="taskId" value={task.id} />
        <select name="status" defaultValue={task.status} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
          {TASK_STATUSES.map((status) => <option key={status} value={status}>{TASK_STATUS_LABELS[status]}</option>)}
        </select>
        <select name="assigned_to_user_id" defaultValue={task.assigned_to_user_id ?? ""} className="w-full rounded border border-slate-600 bg-slate-900 p-2">
          <option value="">Unassigned</option>
          {(members ?? []).map((member: any) => <option key={member.user_id} value={member.user_id}>{(member.profiles as any).email}</option>)}
        </select>
        <input name="due_at" type="datetime-local" defaultValue={task.due_at ? new Date(task.due_at).toISOString().slice(0,16) : ""} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2">Save Task</button>
      </form>
    </section>

    <section>
      <h2 className="text-xl font-medium mb-2">Activity</h2>
      <ul className="space-y-2">{(events ?? []).map((event: any) => <li key={event.id} className="rounded border border-slate-700 p-3"><p className="font-medium">{event.action}</p><p className="text-sm text-slate-300">{JSON.stringify(event.metadata_json)}</p><p className="text-sm text-slate-400">{new Date(event.occurred_at).toLocaleString()}</p></li>)}</ul>
    </section>
  </main>;
}
