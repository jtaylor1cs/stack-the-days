"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function CommentForm({ postSlug, onSubmitted }: { postSlug: string; onSubmitted: () => void }) {
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real users never fill this in
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (website.trim() !== "") return; // bot filled the honeypot, silently drop

    const trimmedName = authorName.trim();
    const trimmedBody = body.trim();
    if (!trimmedName || !trimmedBody) return;

    setStatus("sending");
    const { error } = await supabase
      .from("comments")
      .insert({ post_slug: postSlug, author_name: trimmedName, body: trimmedBody, approved: false });

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("sent");
    setAuthorName("");
    setBody("");
    onSubmitted();
  }

  if (status === "sent") {
    return <p className="comment-note">Thanks — your comment is in the queue and will show up once it's approved.</p>;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={80}
        required
      />
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden="true"
      />
      <textarea
        placeholder="Say something"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        required
      />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Post comment"}
      </button>
      {status === "error" && <p className="comment-note">Something went wrong — try again in a moment.</p>}
    </form>
  );
}
