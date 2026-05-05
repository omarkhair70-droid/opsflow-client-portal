import { requireInternalOrgAccess } from "@/lib/access";

export default async function InternalDashboard({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requireInternalOrgAccess(orgSlug);

  return <main className="p-8"><h1 className="text-2xl font-semibold">Internal Workspace</h1><p className="mt-2">Organization: {org.slug} ({org.name})</p><p className="mt-2 text-slate-300">Dashboard shell only.</p></main>;
}
