import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: https://lionsmma.ca/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};
