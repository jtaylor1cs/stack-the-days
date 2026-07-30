#!/usr/bin/env node
// Scaffolds content/posts/YYYY-MM-DD-slug.md from content/_template.md so every
// day's entry starts from the same clean format. Usage: npm run new -- "Title"
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new -- "Post title"');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const filename = `${date}-${slug}.md`;
const dest = path.join(root, "content", "posts", filename);

if (fs.existsSync(dest)) {
  console.error(`Already exists: content/posts/${filename}`);
  process.exit(1);
}

const template = fs.readFileSync(path.join(root, "content", "_template.md"), "utf8");
const filled = template
  .replace("{{TITLE}}", title)
  .replace("{{DATE}}", date);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, filled);
console.log(`Created content/posts/${filename}`);
