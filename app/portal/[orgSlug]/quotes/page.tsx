import Link from "next/link";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

export default async function PortalQuotesPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requirePortalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: quotes } = await supabase.from("quotes").select("id,title,version_number,status,total_amount,currency,published_at,requests!inner(title)").eq("organization_id", org.id).neq("status","draft").order("published_at", { ascending: false });
  return <main className="p-8 space-y-4"><h1 className="text-2xl font-semibold">Quotes</h1><ul className="space-y-2">{(quotes??[]).map((q:any)=><li key={q.id} className="rounded border border-slate-700 p-3"><Link href={`/portal/${org.slug}/quotes/${q.id}`} className="text-blue-400 hover:underline font-medium">{q.title}</Link><p className="text-sm">Request: {q.requests.title}</p><p className="text-sm">V{q.version_number} · {QUOTE_STATUS_LABELS[q.status as keyof typeof QUOTE_STATUS_LABELS]} · {formatMoney(q.total_amount,q.currency)} · Published: {q.published_at ? new Date(q.published_at).toLocaleString() : "N/A"}</p></li>)}</ul></main>;
}
