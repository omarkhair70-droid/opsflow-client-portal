import { notFound, redirect } from "next/navigation";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { APPROVAL_DECISIONS, APPROVAL_DECISION_LABELS, QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

async function submitDecision(formData: FormData) {
  "use server";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!APPROVAL_DECISIONS.includes(decision as any)) return;

  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/login");

  await supabase.from("approvals").insert({
    organization_id: org.id,
    quote_id: quoteId,
    decision,
    note: note || null,
    decided_by_user_id: userId,
  });

  redirect(`/portal/${orgSlug}/quotes/${quoteId}`);
}

export default async function PortalQuoteDetail({ params }: { params: Promise<{ orgSlug: string; quoteId: string }> }) {
  const { orgSlug, quoteId } = await params;
  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*,requests!inner(title)")
    .eq("organization_id", org.id)
    .eq("id", quoteId)
    .maybeSingle();

  if (!quote || quote.status === "draft") notFound();

  const { data: approval } = await supabase.from("approvals").select("*").eq("quote_id", quote.id).maybeSingle();

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-2xl font-semibold">{quote.title}</h1>
      <p>Request: {quote.requests.title}</p>
      <p>Version: {quote.version_number}</p>
      <p>Status: {QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS]}</p>
      <p>Scope summary: {quote.scope_summary}</p>
      <p>Total: {formatMoney(quote.total_amount, quote.currency)}</p>
      <p>Notes: {quote.notes_to_client || "None"}</p>
      <p>Valid until: {quote.valid_until || "Not set"}</p>
      <p>Published at: {quote.published_at ? new Date(quote.published_at).toLocaleString() : "Not published"}</p>

      {!approval && quote.status === "published" ? (
        <form action={submitDecision} className="space-y-2 max-w-md">
          <input type="hidden" name="orgSlug" value={org.slug} />
          <input type="hidden" name="quoteId" value={quote.id} />
          <select name="decision" className="w-full rounded border border-slate-600 bg-slate-900 p-2">
            {APPROVAL_DECISIONS.map((decisionValue) => (
              <option key={decisionValue} value={decisionValue}>
                {APPROVAL_DECISION_LABELS[decisionValue]}
              </option>
            ))}
          </select>
          <textarea name="note" className="w-full rounded border border-slate-600 bg-slate-900 p-2" />
          <button className="rounded bg-blue-600 px-4 py-2" type="submit">
            Submit Decision
          </button>
        </form>
      ) : approval ? (
        <p>
          Decision: {approval.decision} · {approval.note || "No note"} · {new Date(approval.decided_at).toLocaleString()}
        </p>
      ) : null}
    </main>
  );
}
