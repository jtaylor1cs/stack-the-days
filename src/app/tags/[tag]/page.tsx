import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { tag: string } }) {
  return { title: `#${params.tag} — Stack the Days` };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const posts = (await getAllPosts()).filter((post) => post.tags.includes(params.tag));

  return (
    <main>
      <h1 className="post-title" style={{ marginBottom: "1.5rem" }}>
        #{params.tag}
      </h1>
      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
        {posts.length === 0 && <p>No posts tagged #{params.tag} yet.</p>}
      </div>
    </main>
  );
}
