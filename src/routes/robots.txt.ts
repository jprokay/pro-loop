import { APIEvent } from "@solidjs/start/server";

export function GET(event: APIEvent) {
  return new Response(
    `User-agent: *
Allow: /

# Block access to admin areas
Disallow: /admin/

# Sitemap location
Sitemap: https://proloops.jprokay.com/sitemap.xml`,
    {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
