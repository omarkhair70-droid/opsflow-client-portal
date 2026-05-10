import { notFound, redirect } from "next/navigation";
import { requireInternalOrgAccess } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QUOTE_STATUS_LABELS, formatMoney } from "@/lib/quotes";

async function updateDraft(formData: FormData){"use server";
 const orgSlug=String(formData.get('orgSlug')??''); const quoteId=String(formData.get('quoteId')??''); const org=await requireInternalOrgAccess(orgSlug); const supabase=await createServerSupabaseClient();
 await supabase.from('quotes').update({title:String(formData.get('title')??''),scope_summary:String(formData.get('scope_summary')??''),total_amount:Number(formData.get('total_amount')??0),currency:String(formData.get('currency')??'USD'),notes_to_client:String(formData.get('notes_to_client')??'')||null,valid_until:String(formData.get('valid_until')??'')||null}).eq('id',quoteId).eq('organization_id',org.id).eq('status','draft');
 redirect(`/app/${orgSlug}/quotes/${quoteId}`);
}
async function publishDraft(formData: FormData){"use server";
 const orgSlug=String(formData.get('orgSlug')??''); const quoteId=String(formData.get('quoteId')??''); const org=await requireInternalOrgAccess(orgSlug); const supabase=await createServerSupabaseClient(); const {data:u}=await supabase.auth.getUser(); if(!u.user?.id) redirect('/login');
 const {data:q}=await supabase.from('quotes').select('id,request_id').eq('organization_id',org.id).eq('id',quoteId).eq('status','draft').maybeSingle(); if(!q) return;
 await supabase.from('quotes').update({status:'superseded'}).eq('organization_id',org.id).eq('request_id',q.request_id).in('status',['published','changes_requested']);
 await supabase.from('quotes').update({status:'published',published_by_user_id:u.user.id,published_at:new Date().toISOString()}).eq('id',quoteId).eq('organization_id',org.id).eq('status','draft');
 redirect(`/app/${orgSlug}/quotes/${quoteId}`);
}

export default async function InternalQuoteDetail({params}:{params:Promise<{orgSlug:string;quoteId:string}>}){
 const {orgSlug,quoteId}=await params; const org=await requireInternalOrgAccess(orgSlug); const supabase=await createServerSupabaseClient();
 const [{data:quote},{data:approval},{data:events}] = await Promise.all([
 supabase.from('quotes').select('*,requests!inner(title,clients!inner(name)),creator:profiles!quotes_created_by_user_id_fkey(email),publisher:profiles!quotes_published_by_user_id_fkey(email)').eq('organization_id',org.id).eq('id',quoteId).maybeSingle(),
 supabase.from('approvals').select('*').eq('quote_id',quoteId).maybeSingle(),
 supabase.from('activity_events').select('id,action,metadata_json,occurred_at').eq('organization_id',org.id).eq('entity_type','quote').eq('entity_id',quoteId).order('occurred_at',{ascending:false})]);
 if(!quote) notFound();
 return <main className='p-8 space-y-4'><h1 className='text-2xl font-semibold'>{quote.title}</h1><p>Request: {quote.requests.title} · Client: {quote.requests.clients.name}</p><p>V{quote.version_number} · {QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS]}</p><p>{quote.scope_summary}</p><p>{formatMoney(quote.total_amount,quote.currency)}</p><p>Created by: {quote.creator?.email ?? 'Unknown'}</p>{quote.published_at ? <p>Published by: {quote.publisher?.email ?? 'Unknown'} at {new Date(quote.published_at).toLocaleString()}</p>:null}
 {quote.status==='draft' ? <><form action={updateDraft} className='space-y-2 max-w-md'><input type='hidden' name='orgSlug' value={org.slug}/><input type='hidden' name='quoteId' value={quote.id}/><input name='title' defaultValue={quote.title} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><textarea name='scope_summary' defaultValue={quote.scope_summary} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><input name='total_amount' type='number' step='0.01' defaultValue={quote.total_amount} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><input name='currency' defaultValue={quote.currency} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><textarea name='notes_to_client' defaultValue={quote.notes_to_client ?? ''} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><input name='valid_until' type='date' defaultValue={quote.valid_until ?? ''} className='w-full rounded border border-slate-600 bg-slate-900 p-2'/><button className='rounded bg-blue-600 px-4 py-2'>Update Draft</button></form><form action={publishDraft}><input type='hidden' name='orgSlug' value={org.slug}/><input type='hidden' name='quoteId' value={quote.id}/><button className='rounded bg-emerald-600 px-4 py-2'>Publish Quote</button></form></> : <p>Read-only published decision record.</p>}
 {approval ? <p>Approval: {approval.decision} {approval.note ? `- ${approval.note}`:''}</p>:null}
 <ul>{(events??[]).map((e:any)=><li key={e.id}>{e.action} · {new Date(e.occurred_at).toLocaleString()}</li>)}</ul></main>
}
