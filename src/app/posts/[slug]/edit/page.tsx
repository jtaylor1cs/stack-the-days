"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { FormattingHelp } from "@/components/FormattingHelp";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [draft, setDraft] = useState(true);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const fetchedRef = useRef(false);

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
    if (!supabase || !session || fetchedRef.current) return;
    fetchedRef.current = true;
    supabase
      .from("posts")
      .select("title, date, excerpt, tags, draft, content")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setTitle(data.title);
        setDate(data.date);
        setExcerpt(data.excerpt ?? "");
        setTags((data.tags ?? []).join(", "));
        setDraft(data.draft);
        setContent(data.content);
        setLoaded(true);
      });
  }, [session, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !date || !content.trim()) return;

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setStatus("sending");
    const { error } = await supabase
      .from("posts")
      .update({
        title: trimmedTitle,
        date,
        excerpt: excerpt.trim(),
        tags: tagList,
        draft,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (error) {
      setStatus("error");
      return;
    }

    router.push(draft ? "/manage" : `/posts/${slug}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!supabase) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;

    setStatus("sending");
    const { error } = await supabase.from("posts").delete().eq("slug", slug);

    if (error) {
      setStatus("error");
      return;
    }

    router.push("/manage");
    router.refresh();
  }

  if (!isSupabaseConfigured) {
    return (
      <main>
        <h1 className="post-title">Edit post</h1>
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

  if (notFound) {
    return (
      <main>
        <h1 className="post-title">Edit post</h1>
        <p className="comment-note">No post found with slug &quot;{slug}&quot;.</p>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main>
        <p className="comment-note">Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="post-title">Edit post</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
        <FormattingHelp />
        <textarea
          className="post-body-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="admin-form-actions">
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Saving..." : "Save changes"}
          </button>
          <button type="button" className="delete-link" onClick={handleDelete} disabled={status === "sending"}>
            Delete post
          </button>
        </div>
        {status === "error" && <p className="comment-note">Something went wrong — try again in a moment.</p>}
      </form>
    </main>
  );
}
