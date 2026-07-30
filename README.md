# Stack the Days

**learning electric guitar from zero, one logged day at a time**

A blog about an ultralearning project, with a daily-writing workflow that
stays clean, and comments that scale toward eventual monetization without a
rewrite.

---

## Run it

```bash
cd ~/Desktop/stack-the-days
npm install
npm run dev
```

Opens at `http://localhost:3000`. Comments will show a "needs Supabase"
message until you set up the env vars below — everything else works without
it.

Other scripts: `npm run build`, `npm run typecheck`.

---

## Writing a post every day

```bash
npm run new -- "Day 1: open strings and blisters"
```

This creates `content/posts/YYYY-MM-DD-slug.md` from `content/_template.md`,
pre-filled with today's date and the title you gave it. The template keeps
every entry the same shape (what I practiced, how long, what clicked, what
didn't, tomorrow's focus) so a year of posts stays scannable.

Frontmatter fields:

| Field     | Meaning                                            |
| --------- | --------------------------------------------------- |
| `title`   | Post title                                          |
| `date`    | `YYYY-MM-DD`, used for sorting and display           |
| `excerpt` | One-liner shown on the home page and in RSS          |
| `tags`    | e.g. `["ultralearning", "guitar"]` — powers `/tags/*` |
| `draft`   | `true` hides it in production; set `false` to publish |

Posts are plain markdown files, so they're just git history — no CMS, no
database migration, no lock-in.

---

## Setting up comments (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor, paste in `supabase/schema.sql`, and run it. This
   creates the `comments` table with row-level security: anyone can submit a
   comment, but only `approved = true` comments are publicly readable.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL
   and anon key (Project Settings → API).
4. Restart `npm run dev`.

**Moderating comments**: every new comment lands as `approved = false`.
Open your Supabase project's table editor, find the `comments` table, and
flip `approved` to `true` on the ones you want public. There's no admin UI
for this yet — see "gaps" below.

---

## Deploying (Vercel)

Not done yet — this is local-only for now. When you're ready:

1. Push this folder to a GitHub repo.
2. Import it at [vercel.com](https://vercel.com) → New Project.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project
   settings (same values as your `.env.local`).
4. Deploy. Vercel auto-builds on every push to `main`.

---

## Monetization path

Nothing is wired up yet, but the stack is chosen so nothing here needs to be
rebuilt when you're ready:

- **Ads/sponsors**: `<AdSlot>` in `src/components/AdSlot.tsx` marks where a
  real ad or sponsor block would render — currently just a placeholder.
- **Paid posts / subscriptions**: Supabase already gives you real auth and a
  Postgres database. Gating a post later is a matter of adding a
  `subscribers` table and checking it in `getPostBySlug`/the post page —
  not a new backend.
- **Newsletter**: RSS is already live at `/rss.xml`; wiring it into
  something like Buttondown or a Supabase-backed email list is additive.

---

## Structure

```
stack-the-days/
├── content/
│   ├── posts/*.md              one file per post
│   └── _template.md            daily-entry template used by `npm run new`
├── scripts/new-post.mjs        scaffolds today's post
├── supabase/schema.sql         comments table + RLS policies — read before you touch Supabase
├── src/
│   ├── app/
│   │   ├── layout.tsx, globals.css   retro design system (warm paper + rust/mustard/olive)
│   │   ├── page.tsx                  home: post list, newest first
│   │   ├── posts/[slug]/page.tsx     post detail + comments
│   │   ├── tags/[tag]/page.tsx       posts filtered by tag
│   │   ├── rss.xml/route.ts, sitemap.ts
│   ├── components/
│   │   ├── PostCard.tsx, AdSlot.tsx
│   │   └── CommentSection.tsx, CommentForm.tsx
│   └── lib/
│       ├── posts.ts            fs + gray-matter + remark → HTML
│       ├── supabaseClient.ts
│       └── format.ts
```

**Stack:** Next.js 14 (App Router) + TypeScript, markdown posts via
`gray-matter`/`remark`, Supabase for comments. Hand-rolled CSS, no framework —
same approach as the sibling Meritrail project, keeps the retro look fully
under your control.

---

## Gaps and honest problems

**1. No comment moderation UI.** You flip `approved` in the Supabase
dashboard by hand. Fine at low comment volume; annoying past a few dozen a
week. A small authenticated `/admin` page is the natural next step.

**2. No spam protection beyond a honeypot field.** Good enough for casual
bots, not for a determined spammer. If it becomes a problem, add rate
limiting (e.g. by IP via a Supabase edge function) before anything fancier.

**3. Tags have no dedicated index page.** `/tags/[tag]` works once you know
the tag, but there's no `/tags` page listing all of them. Cheap to add once
there are enough tags to matter.

**4. Reading time and metadata are computed at request time for post
pages.** Fine at this scale; if the post count gets large, pre-computing at
build time is the lever.

**5. No image handling beyond whatever markdown/relative paths you use.** No
optimized image pipeline yet — add `next/image` when posts start including
photos or gear shots.
