import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="post-card">
      <h2 className="post-card-title">
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <div className="post-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="dot">&middot;</span>
        <span>{post.readingTime}</span>
      </div>
      {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`} className="tag-pill">
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
