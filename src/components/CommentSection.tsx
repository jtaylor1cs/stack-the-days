"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { CommentForm } from "./CommentForm";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);

  const loadComments = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("comments")
      .select("id, author_name, body, created_at")
      .eq("post_slug", postSlug)
      .eq("approved", true)
      .order("created_at", { ascending: true });
    setComments(data ?? []);
  }, [postSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (!isSupabaseConfigured) {
    return (
      <section className="comments">
        <h2>Comments</h2>
        <p className="comment-note">
          Comments need Supabase configured — add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (see the README).
        </p>
      </section>
    );
  }

  return (
    <section className="comments">
      <h2>Comments</h2>
      {comments === null && <p className="comment-note">Loading comments&hellip;</p>}
      {comments !== null && comments.length === 0 && (
        <p className="comment-note">No comments yet — be the first.</p>
      )}
      {comments && comments.length > 0 && (
        <div>
          {comments.map((c) => (
            <div className="comment" key={c.id}>
              <span className="comment-author">{c.author_name}</span>
              <span className="comment-date">{new Date(c.created_at).toLocaleDateString()}</span>
              <p className="comment-body">{c.body}</p>
            </div>
          ))}
        </div>
      )}
      <CommentForm postSlug={postSlug} onSubmitted={loadComments} />
    </section>
  );
}
