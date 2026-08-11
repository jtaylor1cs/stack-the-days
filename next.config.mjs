/** @type {import('next').NextConfig} */
const nextConfig = {
  // Posts/comments come from Supabase and can change at any time (via /new,
  // /edit, or the dashboard) without a redeploy — disable the client-side
  // router cache for dynamic pages so every navigation re-fetches instead of
  // showing what was cached from an earlier visit.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
