import { notFound, redirect } from "next/navigation";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { APPROVAL_DECISIONS, APPROVAL_DECISION_LABELS, QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

async function submitDecision(formData: FormData) {"use server";
  const orgSlug=String(formData.get("orgSlug")??""); const quoteId=String(formData.get("quoteId")??""); const decision=String(formData.get("decision")??""); const note=String(formData.get("note")??"").trim();
  if (!APPROVAL_DECISIONS.includes(decision as any)) return;
  await requirePortalOrgAccess(orgSlug); const supabase=await createServerSupabaseClient(); const {data:u}=await supabase.auth.getUser(); if(!u.user?.id) redirect('/login');
  await supabase.from('approvals').insert({quote_id:quoteId, decision, note:note||null, decided_by_user_id:u.user.id, organization_id:(await requirePortalOrgAccess(orgSlug)).id});
  redirect(`/portal/${orgSlug}/quotes/${quoteId}`);
}

export default async function PortalQuoteDetail({ params }: { params: Promise<{ orgSlug: string; quoteId: string }> }) {
  const { orgSlug, quoteId } = await params; const org = await requirePortalOrgAccess(orgSlug); const supabase = await createServerSupabaseClient();
  const { data: quote } = await supabase.from("quotes").select("*,requests!inner(title)").eq("organization_id", org.id).eq("id", quoteId).maybeSingle();
  if (!quote || quote.status === 'draft') notFound();
  const { data: approval } = await supabase.from('approvals').select('*').eq('quote_id', quote.id).maybeSingle();
  return <main className="p-8 space-y-3"><h1 className="text-2xl font-semibold">{quote.title}</h1><p>Request: {quote.requests.title}</p><p>Status: {QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS]}</p><p>{quote.scope_summary}</p><p>{formatMoney(quote.total_amount, quote.currency)}</p><p>{quote.notes_to_client || "No notes."}</p>{!approval && quote.status==='published' ? <form action={submitDecision} className="space-y-2 max-w-md"><input type="hidden" name="orgSlug" value={org.slug}/><input type="hidden" name="quoteId" value={quote.id}/><select name="decision" className="w-full rounded border border-slate-600 bg-slate-900 p-2">{APPROVAL_DECISIONS.map((d)=><option key={d} value={d}>{APPROVAL_DECISION_LABELS[d]}</option>)}</select><textarea name="note" className="w-full rounded border border-slate-600 bg-slate-900 p-2"/><button className="rounded bg-blue-600 px-4 py-2" type="submit">Submit</button></form> : <p>Decision: {approval?.decision ?? quote.status} {approval?.note ? `(${approval.note})` : ''}</p>}</main>;
}
