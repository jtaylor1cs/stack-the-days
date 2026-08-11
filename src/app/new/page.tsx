"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const BODY_PLACEHOLDER = `What I practiced today (be specific — song, technique, drill)

Time spent

What clicked / what didn't

Tomorrow's focus`;

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewPostPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("ultralearning, guitar");
  const [draft, setDraft] = useState(true);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "duplicate">("idle");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !content.trim()) return;

    const date = new Date().toISOString().slice(0, 10);
    const slug = `${date}-${slugify(trimmedTitle)}`;
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setStatus("sending");
    const { error } = await supabase.from("posts").insert({
      slug,
      title: trimmedTitle,
      date,
      excerpt: excerpt.trim(),
      tags: tagList,
      draft,
      content,
    });

    if (error) {
      setStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }

    if (draft) {
      router.push("/");
    } else {
      router.push(`/posts/${slug}`);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main>
        <h1 className="post-title">Add post</h1>
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
      <h1 className="post-title">Add post</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Excerpt (optional)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags, comma-separated"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <label className="admin-form-checkbox">
          <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
          Save as draft
        </label>
        <textarea
          className="post-body-input"
          placeholder={BODY_PLACEHOLDER}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Saving..." : "Save post"}
        </button>
        {status === "duplicate" && (
          <p className="comment-note">A post with that title already exists today — tweak the title.</p>
        )}
        {status === "error" && <p className="comment-note">Something went wrong — try again in a moment.</p>}
        {draft && (
          <p className="comment-note">
            Saved as a draft won&apos;t appear on the site until you flip <code>draft</code> to false in the
            Supabase table editor.
          </p>
        )}
      </form>
    </main>
  );
}
