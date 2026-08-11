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

Opens at `http://localhost:3000`. Posts and comments both need Supabase set
up (below) — until then you'll see empty/"needs Supabase" states.

Other scripts: `npm run build`, `npm run typecheck`.

---

## Writing a post

1. Log in at `/login` with the admin email/password (see setup below).
2. "Add post" appears in the nav — click it.
3. Fill in title, an optional excerpt, comma-separated tags (defaults to
   `ultralearning, guitar`), and the body in plain markdown. "Save as draft"
   is checked by default.
4. Submit. If you left it as a draft, it's saved but not public yet — flip
   `draft` to `false` on the row in the Supabase table editor when you're
   ready to publish (there's no publish button yet, see "gaps" below). If
   you unchecked draft before saving, it's live immediately — no redeploy
   needed, even on the deployed site.

Posts live in a Supabase table now (`slug`, `title`, `date`, `excerpt`,
`tags`, `draft`, `content`), not markdown files — this is what makes writing
from the browser possible on the live site, not just locally.

To edit or delete a post later: "My posts" in the nav (while logged in)
lists everything, including drafts, with a Delete button on each row and a
link to an edit form — which also has its own Delete button. The slug (and
so the URL) never changes on edit, so links and comments stay intact.
Deleting asks for confirmation and can't be undone.

---

## Setting up posts (Supabase)

1. In the same Supabase project used for comments, open the SQL editor,
   paste in `supabase/posts_schema.sql`, and run it. This creates the
   `posts` table: anyone can read published posts, only the one admin
   account (matched by email) can create/edit/delete posts or read drafts.
2. Create that admin account: Authentication → Users → Add user → your
   email, set a password, check "Auto Confirm User".
3. Disable public sign-ups: Authentication → Settings → turn off "Allow new
   users to sign up" — this is what keeps the admin check in
   `posts_schema.sql` airtight, since nobody else can get an account at all.
4. One-time only: the repo's original posts still live in
   `content/posts/*.md`. To move them into the table, temporarily add
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Project
   Settings → API → `service_role` secret), run `npm run migrate-posts`,
   then remove those two lines from `.env.local` again — the app itself
   never needs the service role key, only the one-time import script does.

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
│   └── posts/*.md               historical posts — source for the one-time migration only
├── scripts/migrate-posts.mjs    one-time import of content/posts/*.md into Supabase
├── supabase/
│   ├── schema.sql                comments table + RLS policies
│   └── posts_schema.sql          posts table + RLS policies — read before you touch Supabase
├── src/
│   ├── app/
│   │   ├── layout.tsx, globals.css   retro design system (warm paper + rust/mustard/olive)
│   │   ├── page.tsx                  home: post list, newest first
│   │   ├── posts/[slug]/page.tsx     post detail + comments
│   │   ├── tags/[tag]/page.tsx       posts filtered by tag
│   │   ├── login/page.tsx            admin sign-in
│   │   ├── new/page.tsx              add-post editor (logged-in only)
│   │   ├── manage/page.tsx           list of all posts incl. drafts (logged-in only)
│   │   ├── posts/[slug]/edit/page.tsx  edit an existing post (logged-in only)
│   │   ├── rss.xml/route.ts, sitemap.ts
│   ├── components/
│   │   ├── PostCard.tsx, AdSlot.tsx, AuthStatus.tsx, EditPostLink.tsx
│   │   └── CommentSection.tsx, CommentForm.tsx
│   └── lib/
│       ├── posts.ts            Supabase queries + remark → HTML
│       ├── supabaseClient.ts
│       └── format.ts
```

**Stack:** Next.js 14 (App Router) + TypeScript, posts and comments both in
Supabase (Postgres + RLS + Auth), markdown-to-HTML via `remark`. Hand-rolled
CSS, no framework — same approach as the sibling Meritrail project, keeps
the retro look fully under your control.

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

