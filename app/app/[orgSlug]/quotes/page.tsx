import Link from "next/link";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

export default async function InternalQuotesPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  const supabase = await createServerSupabaseClient();
  const { data: quotes } = await supabase.from("quotes").select("id,title,version_number,status,total_amount,currency,created_at,requests!inner(title,clients!inner(name))").eq("organization_id", org.id).order("created_at", { ascending: false });
  return <main className="p-8 space-y-4"><h1 className="text-2xl font-semibold">Quotes</h1><ul className="space-y-2">{(quotes??[]).map((q:any)=><li key={q.id} className="rounded border border-slate-700 p-3"><Link href={`/app/${org.slug}/quotes/${q.id}`} className="text-blue-400 hover:underline font-medium">{q.title}</Link><p className="text-sm">Request: {q.requests.title} · Client: {q.requests.clients.name}</p><p className="text-sm">V{q.version_number} · {QUOTE_STATUS_LABELS[q.status as keyof typeof QUOTE_STATUS_LABELS]} · {formatMoney(q.total_amount,q.currency)} · {new Date(q.created_at).toLocaleString()}</p></li>)}</ul></main>;
}
