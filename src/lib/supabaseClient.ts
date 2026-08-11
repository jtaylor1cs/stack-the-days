import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      // Next.js caches fetch() calls made from Server Components by default,
      // including ones made internally by this client — without this, posts
      // edited/added via Supabase can keep showing old data on
      // force-dynamic pages until the server process restarts.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
