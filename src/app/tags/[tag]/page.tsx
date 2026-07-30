import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export function generateMetadata({ params }: { params: { tag: string } }) {
  return { title: `#${params.tag} — Stack the Days` };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const posts = getAllPosts().filter((post) => post.tags.includes(params.tag));

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
