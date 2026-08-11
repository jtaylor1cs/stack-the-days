"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type PostRow = { slug: string; title: string; date: string; draft: boolean };

export default function ManagePostsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [posts, setPosts] = useState<PostRow[] | null>(null);

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

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("posts")
      .select("slug, title, date, draft")
      .order("date", { ascending: false })
      .then(({ data }) => setPosts(data ?? []));
  }, [session]);

  if (!isSupabaseConfigured) {
    return (
      <main>
        <h1 className="post-title">My posts</h1>
        <p className="comment-note">Needs Supabase configured — see the README.</p>
      </main>
    );
  }

  if (session === undefined || session === null) {
    return (
      <main>
        <p className="comment-note">Checking login...</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="post-title" style={{ marginBottom: "1.5rem" }}>
        My posts
      </h1>
      {posts === null && <p className="comment-note">Loading...</p>}
      {posts?.length === 0 && <p className="comment-note">No posts yet.</p>}
      <div className="post-list">
        {posts?.map((post) => (
          <article key={post.slug} className="post-card">
            <h2 className="post-card-title">
              <Link href={`/posts/${post.slug}/edit`}>{post.title}</Link>
            </h2>
            <div className="post-meta">
              <time dateTime={post.date}>{post.date}</time>
              {post.draft && <span className="draft-badge">draft</span>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
