-- Stack the Days — posts schema
-- Paste this into the Supabase SQL editor (alongside schema.sql) and run it.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  date date not null default current_date,
  excerpt text not null default '',
  tags text[] not null default '{}',
  draft boolean not null default true,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_date_idx on posts (date desc, created_at desc);

alter table posts enable row level security;

-- Anyone can read published posts.
create policy "public can read published posts"
  on posts for select
  using (draft = false);

-- The site owner (matched by email on their auth token) can read every post,
-- including drafts.
create policy "admin can read all posts"
  on posts for select
  using (auth.jwt() ->> 'email' = 'jtsplash1@gmail.com');

-- Only the site owner can create, edit, or delete posts. There is no public
-- sign-up path in the app, and sign-ups should be disabled in the Supabase
-- dashboard (Authentication → Settings) so this check can't be bypassed by
-- someone else creating an account.
create policy "admin can insert posts"
  on posts for insert
  with check (auth.jwt() ->> 'email' = 'jtsplash1@gmail.com');

create policy "admin can update posts"
  on posts for update
  using (auth.jwt() ->> 'email' = 'jtsplash1@gmail.com')
  with check (auth.jwt() ->> 'email' = 'jtsplash1@gmail.com');

create policy "admin can delete posts"
  on posts for delete
  using (auth.jwt() ->> 'email' = 'jtsplash1@gmail.com');
