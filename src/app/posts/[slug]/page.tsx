import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { CommentSection } from "@/components/CommentSection";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return { title: `${post.title} — Stack the Days`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main>
      <Link href="/" className="back-link">
        &larr; All posts
      </Link>

      <article>
        <header className="post-header">
          <div className="post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="dot">&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="tag-list">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="tag-pill">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <AdSlot />

      <CommentSection postSlug={post.slug} />
    </main>
  );
}
