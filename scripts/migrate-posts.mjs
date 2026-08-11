#!/usr/bin/env node
// One-time import of content/posts/*.md into the Supabase `posts` table.
// Uses the service role key (bypasses RLS) since this runs unauthenticated.
// Safe to re-run — upserts on slug.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// (Project Settings → API → service_role secret). Usage: npm run migrate-posts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const postsDir = path.join(root, "content", "posts");

// No dotenv dependency — .env.local is just KEY=VALUE lines, read it directly.
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running this.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")) : [];

if (files.length === 0) {
  console.log("No markdown posts found in content/posts — nothing to migrate.");
  process.exit(0);
}

const rows = files.map((filename) => {
  const slug = filename.replace(/\.md$/, "");
  const raw = matter(fs.readFileSync(path.join(postsDir, filename), "utf8"));
  const data = raw.data;
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft ?? false),
    content: raw.content,
  };
});

const { data: inserted, error } = await supabase.from("posts").upsert(rows, { onConflict: "slug" }).select("slug");

if (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
}

for (const row of inserted ?? []) {
  console.log(`Migrated: ${row.slug}`);
}
console.log(`Done — ${inserted?.length ?? 0} post(s) migrated.`);
