-- Stack the Days — comments schema
-- Paste this into the Supabase SQL editor (once you've created a project) and run it.

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_slug_idx on comments (post_slug);

alter table comments enable row level security;

-- Anyone can read comments that have been approved. Unapproved comments are
-- invisible to the public until you flip the flag in the table editor.
create policy "public can read approved comments"
  on comments for select
  using (approved = true);

-- Anyone can submit a comment. It lands as approved = false by default —
-- there is no client-side way to insert an already-approved comment because
-- the column default handles that, not the request payload.
create policy "public can insert comments"
  on comments for insert
  with check (
    approved = false
    and char_length(author_name) between 1 and 80
    and char_length(body) between 1 and 2000
  );

-- No public update/delete policy: moderation happens only from the
-- Supabase dashboard (or later, an authenticated admin view), never from
-- the public anon key.
