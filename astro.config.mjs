import { defineConfig } from 'astro/config';

// Vercel provides the production domain at build time; SITE_URL overrides it.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : 'http://localhost:4321');

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: false,
});
