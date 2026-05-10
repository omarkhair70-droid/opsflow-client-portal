import Link from "next/link";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TASK_STATUS_LABELS } from "@/lib/tasks";

export default async function InternalTasksPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, due_at, created_at, requests!inner(id,title), assignee:profiles!tasks_assigned_to_user_id_fkey(email)")
    .eq("organization_id", org.id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <main className="p-8 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-slate-300 mt-2">All internal tasks for {org.name}.</p>
      </section>
      <ul className="space-y-2">
        {(tasks ?? []).map((task: any) => (
          <li key={task.id} className="rounded border border-slate-700 p-3">
            <p className="font-medium"><Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/tasks/${task.id}`}>{task.title}</Link></p>
            <p className="text-sm">Request: <Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/requests/${task.requests.id}`}>{task.requests.title}</Link></p>
            <p className="text-sm">Status: {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}</p>
            <p className="text-sm">Assignee: {task.assignee?.email ?? "Unassigned"}</p>
            <p className="text-sm">Due: {task.due_at ? new Date(task.due_at).toLocaleString() : "No due date"}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
