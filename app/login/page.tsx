"use client";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setMessage(error ? error.message : "Check your email for the login link.");
  }

  return <main className="mx-auto max-w-md p-8"><h1 className="text-2xl font-semibold">Login</h1><input className="mt-4 w-full rounded border border-slate-700 bg-slate-900 p-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com"/><button className="mt-3 rounded bg-white px-4 py-2 text-black" onClick={login}>Send magic link</button>{message && <p className="mt-2 text-sm">{message}</p>}</main>;
}
