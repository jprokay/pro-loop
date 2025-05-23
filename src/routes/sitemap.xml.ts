import { APIEvent } from "@solidjs/start/server";
import { db } from "~/db/db";

export async function GET(event: APIEvent) {
  const baseUrl = "https://pro-loops.jprokay.com";

  // Static routes
  const staticRoutes = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/practice", priority: "0.9", changefreq: "weekly" },
    { url: "/practice/song", priority: "0.8", changefreq: "weekly" },
  ];

  /**
   * TODO: Consider publishing out loops to the sitemap for more SEO
   *
  // Get published loops (limit to most recent/popular 1000)
  // Only include public loops if you have a public/private flag
  const loops = await db.loops
    .orderBy("id")
    .reverse()
    .limit(1000)
    .toArray();
    
  const loopUrls = loops.map(loop => ({
    url: `/practice/song?loopId=${loop.id}&videoId=${loop.videoId}`,
    lastmod: new Date().toISOString().split('T')[0],
    priority: "0.7",
    changefreq: "monthly"
  }));
  */

  const allUrls = [...staticRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
