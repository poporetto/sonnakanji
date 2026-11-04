import { defineConfig } from 'astro/config';
import slugs from './src/data/slugs.json' with { type: 'json' };

// Vercel provides the production domain at build time; SITE_URL overrides it.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : 'http://localhost:4321');

// Static pages at the original /kanji/上/ URLs, as a backstop to vercel.json.
const redirects = Object.fromEntries(Object.entries(slugs).map(([k, slug]) => [`/kanji/${k}`, `/kanji/${slug}/`]));

export default defineConfig({
  site,
  redirects,
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: false,
});
