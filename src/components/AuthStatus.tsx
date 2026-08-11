"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export function AuthStatus() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured || session === undefined) return null;

  if (!session) {
    return <Link href="/login">Log in</Link>;
  }

  return (
    <>
      <Link href="/new">Add post</Link>
      <button type="button" onClick={() => supabase?.auth.signOut()}>
        Log out
      </button>
    </>
  );
}
