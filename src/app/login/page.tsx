"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setStatus("sending");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      return;
    }

    router.push("/");
  }

  if (!isSupabaseConfigured) {
    return (
      <main>
        <h1 className="post-title">Log in</h1>
        <p className="comment-note">Needs Supabase configured — see the README.</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="post-title">Log in</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Logging in..." : "Log in"}
        </button>
        {status === "error" && <p className="comment-note">Wrong email or password.</p>}
      </form>
    </main>
  );
}
