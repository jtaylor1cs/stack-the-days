import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";
import { supabase } from "./supabaseClient";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  draft: boolean;
  readingTime: string;
};

export type Post = PostMeta & {
  html: string;
};

type PostRow = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  draft: boolean;
  content: string;
};

function rowToMeta(row: PostRow): PostMeta {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt ?? "",
    tags: row.tags ?? [],
    draft: row.draft,
    readingTime: readingTime(row.content).text,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, excerpt, tags, draft, content")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToMeta);
}

export async function getAllTags(): Promise<string[]> {
  const tags = new Set<string>();
  for (const post of await getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, excerpt, tags, draft, content")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const meta = rowToMeta(data);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(data.content);

  return { ...meta, html: processed.toString() };
}
