import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

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

function readPostFile(filename: string): { slug: string; raw: matter.GrayMatterFile<string> } {
  const slug = filename.replace(/\.md$/, "");
  const fullPath = path.join(POSTS_DIR, filename);
  const raw = matter(fs.readFileSync(fullPath, "utf8"));
  return { slug, raw };
}

function toMeta(slug: string, raw: matter.GrayMatterFile<string>): PostMeta {
  const data = raw.data as Record<string, unknown>;
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft ?? false),
    readingTime: readingTime(raw.content).text,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((filename) => {
    const { slug, raw } = readPostFile(filename);
    return toMeta(slug, raw);
  });

  const visible = posts.filter((p) => !p.draft || process.env.NODE_ENV !== "production");
  return visible.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = matter(fs.readFileSync(fullPath, "utf8"));
  const meta = toMeta(slug, raw);

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(raw.content);

  return { ...meta, html: processed.toString() };
}
