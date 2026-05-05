import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">OpsFlow Phase 1</h1>
      <p className="mt-4 text-slate-300">Foundation for auth, tenants, and role-based shells.</p>
      <div className="mt-6 flex gap-4">
        <Link href="/auth/sign-in" className="rounded bg-white px-4 py-2 text-black">Sign in</Link>
      </div>
    </main>
  );
}
