import { notFound, redirect } from "next/navigation";
import { requireInternalOrgMembership } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

const EDIT_ROLES = new Set(["owner", "admin", "manager"]);

async function updateDraft(formData: FormData) {
  "use server";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const membership = await requireInternalOrgMembership(orgSlug);
  if (!EDIT_ROLES.has(membership.role)) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("quotes")
    .update({
      title: String(formData.get("title") ?? ""),
      scope_summary: String(formData.get("scope_summary") ?? ""),
      total_amount: Number(formData.get("total_amount") ?? 0),
      currency: String(formData.get("currency") ?? "USD"),
      notes_to_client: String(formData.get("notes_to_client") ?? "") || null,
      valid_until: String(formData.get("valid_until") ?? "") || null,
    })
    .eq("id", quoteId)
    .eq("organization_id", membership.id)
    .eq("status", "draft");

  redirect(`/app/${orgSlug}/quotes/${quoteId}`);
}

async function publishDraft(formData: FormData) {
  "use server";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const membership = await requireInternalOrgMembership(orgSlug);
  if (!EDIT_ROLES.has(membership.role)) return;

  const supabase = await createServerSupabaseClient();
  await supabase.rpc("publish_quote", { p_quote_id: quoteId });
  redirect(`/app/${orgSlug}/quotes/${quoteId}`);
}

export default async function InternalQuoteDetail({
  params,
}: {
  params: Promise<{ orgSlug: string; quoteId: string }>;
}) {
  const { orgSlug, quoteId } = await params;
  const membership = await requireInternalOrgMembership(orgSlug);
  const canEdit = EDIT_ROLES.has(membership.role);
  const supabase = await createServerSupabaseClient();

  const [{ data: quote }, { data: approval }, { data: events }] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "*,requests!inner(title,clients!inner(name)),creator:profiles!quotes_created_by_user_id_fkey(email),publisher:profiles!quotes_published_by_user_id_fkey(email)",
      )
      .eq("organization_id", membership.id)
      .eq("id", quoteId)
      .maybeSingle(),
    supabase.from("approvals").select("*").eq("quote_id", quoteId).maybeSingle(),
    supabase
      .from("activity_events")
      .select("id,action,metadata_json,occurred_at")
      .eq("organization_id", membership.id)
      .eq("entity_type", "quote")
      .eq("entity_id", quoteId)
      .order("occurred_at", { ascending: false }),
  ]);

  if (!quote) notFound();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">{quote.title}</h1>
      <p>Request: {quote.requests.title} · Client: {quote.requests.clients.name}</p>
      <p>Version: {quote.version_number}</p>
      <p>Status: {QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS]}</p>
      <p>Scope: {quote.scope_summary}</p>
      <p>Total: {formatMoney(quote.total_amount, quote.currency)}</p>
      <p>Notes to client: {quote.notes_to_client || "None"}</p>
      <p>Valid until: {quote.valid_until || "Not set"}</p>
      <p>Created by: {quote.creator?.email ?? "Unknown"}</p>
      <p>Published by: {quote.publisher?.email ?? "Not published"}</p>
      <p>Published at: {quote.published_at ? new Date(quote.published_at).toLocaleString() : "Not published"}</p>

      {quote.status === "draft" && canEdit ? (
        <>
          <form action={updateDraft} className="space-y-2 max-w-md">
            <input type="hidden" name="orgSlug" value={membership.slug} />
            <input type="hidden" name="quoteId" value={quote.id} />
            <input name="title" defaultValue={quote.title} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <textarea name="scope_summary" defaultValue={quote.scope_summary} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <input name="total_amount" type="number" step="0.01" defaultValue={quote.total_amount} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <input name="currency" defaultValue={quote.currency} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <textarea name="notes_to_client" defaultValue={quote.notes_to_client ?? ""} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <input name="valid_until" type="date" defaultValue={quote.valid_until ?? ""} className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
            <button className="rounded bg-blue-600 px-4 py-2">Update Draft</button>
          </form>
          <form action={publishDraft}>
            <input type="hidden" name="orgSlug" value={membership.slug} />
            <input type="hidden" name="quoteId" value={quote.id} />
            <button className="rounded bg-emerald-600 px-4 py-2">Publish Quote</button>
          </form>
        </>
      ) : null}

      {approval ? (
        <p>
          Approval: {approval.decision} · {approval.note || "No note"} · {new Date(approval.decided_at).toLocaleString()}
        </p>
      ) : null}

      <section>
        <h2 className="text-xl font-medium">Quote Activity</h2>
        <ul className="space-y-2">
          {(events ?? []).map((event: any) => (
            <li key={event.id} className="rounded border border-slate-700 p-3">
              <p>{event.action}</p>
              <p className="text-sm text-slate-300">{JSON.stringify(event.metadata_json)}</p>
              <p className="text-sm text-slate-400">{new Date(event.occurred_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
