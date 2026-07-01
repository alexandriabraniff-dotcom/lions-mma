// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://lionsmma.ca',
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap(),
  ],

  adapter: vercel(),
});