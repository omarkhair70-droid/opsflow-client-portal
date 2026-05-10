import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REQUEST_STATUS_LABELS } from "@/lib/requests";
import { QUOTE_STATUS_LABELS } from "@/lib/quotes";

export default async function PortalRequestDetail({ params }: { params: Promise<{ orgSlug: string; requestId: string }> }) {
  const { orgSlug, requestId } = await params; const org = await requirePortalOrgAccess(orgSlug); const supabase = await createServerSupabaseClient();
  const [{data:request},{data:quotes}] = await Promise.all([
    supabase.from("requests").select("id, title, description, status, created_at").eq("organization_id", org.id).eq("id", requestId).maybeSingle(),
    supabase.from('quotes').select('id,title,version_number,status,total_amount,currency').eq('organization_id',org.id).eq('request_id',requestId).neq('status','draft').order('version_number',{ascending:false})
  ]);
  if (!request) notFound();
  return <main className="p-8 space-y-4"><h1 className="text-2xl font-semibold">{request.title}</h1><p className="text-slate-300">{request.description || "No description provided."}</p><p>Status: {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]}</p><p>Created: {new Date(request.created_at).toLocaleString()}</p><section><h2 className="text-xl font-medium">Quotes</h2><ul className="space-y-2">{(quotes??[]).map((q:any)=><li key={q.id}><Link className="text-blue-400 hover:underline" href={`/portal/${org.slug}/quotes/${q.id}`}>V{q.version_number} - {q.title}</Link> ({QUOTE_STATUS_LABELS[q.status as keyof typeof QUOTE_STATUS_LABELS]})</li>)}</ul></section></main>;
}
