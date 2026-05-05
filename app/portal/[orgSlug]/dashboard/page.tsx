import { requirePortalOrgAccess } from "@/lib/access";

export default async function PortalDashboard({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await requirePortalOrgAccess(orgSlug);

  return <main className="p-8"><h1 className="text-2xl font-semibold">Client Portal</h1><p className="mt-2">Organization: {org.slug} ({org.name})</p><p className="mt-2 text-slate-300">Client dashboard shell only.</p></main>;
}
