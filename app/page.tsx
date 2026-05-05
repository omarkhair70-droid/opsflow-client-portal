import Link from "next/link";
export default function HomePage() {
  return <main className="p-8"><h1 className="text-3xl font-bold">OpsFlow Phase 1</h1><div className="mt-4"><Link className="rounded bg-white px-4 py-2 text-black" href="/login">Login</Link></div></main>;
}
