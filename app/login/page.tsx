"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loginWithGoogle() {
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Login</h1>
      <button
        className="mt-4 rounded bg-white px-4 py-2 text-black disabled:cursor-not-allowed disabled:opacity-70"
        onClick={loginWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? "Redirecting to Google..." : "Continue with Google"}
      </button>
      {errorMessage && <p className="mt-2 text-sm text-red-300">{errorMessage}</p>}
    </main>
  );
}
