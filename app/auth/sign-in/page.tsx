"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signIn() {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setMessage(error ? error.message : "Check your email for a magic link.");
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-4 w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="you@company.com" />
      <button onClick={signIn} className="mt-3 rounded bg-white px-4 py-2 text-black">Send magic link</button>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </main>
  );
}
