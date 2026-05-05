export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      <section className="rounded border border-slate-700 bg-slate-900 p-4">{children}</section>
    </main>
  );
}
