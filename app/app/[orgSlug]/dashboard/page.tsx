import Link from "next/link";
import { requireInternalOrgAccess } from "@/lib/access";

export default async function InternalDashboard({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requireInternalOrgAccess(orgSlug);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Internal Workspace</h1>
      <p className="mt-2">Organization: {org.slug} ({org.name})</p>
      <p className="mt-2 text-slate-300">Dashboard shell only.</p>
      <p className="mt-4"><Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/requests`}>Go to Requests</Link></p>
      <p className="mt-2"><Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/tasks`}>Go to Tasks</Link></p>
      <p className="mt-2"><Link className="text-blue-400 hover:underline" href={`/app/${org.slug}/quotes`}>Go to Quotes</Link></p>
    </main>
  );
}
