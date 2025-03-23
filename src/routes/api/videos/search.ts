import type { APIEvent } from "@solidjs/start/server";
import { rateLimit } from "~/utils/rate-limiter";

const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

export async function GET(event: APIEvent) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  
  // Apply rate limiting - 50 searches per hour per client
  const rateLimitResponse = await rateLimit(event, {
    limit: 50,
    windowInSeconds: 60 * 60, // 1 hour
    identifier: "youtube-search",
  });

  // If rate limited, return the response
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Get search query from URL
  const url = new URL(event.request.url);
  const query = url.searchParams.get("q");
  const maxResults = url.searchParams.get("maxResults") || "10";

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Missing search query parameter 'q'" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Fetch search results from YouTube API
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.append("part", "snippet");
    searchUrl.searchParams.append("q", query);
    searchUrl.searchParams.append("type", "video");
    searchUrl.searchParams.append("maxResults", maxResults);
    searchUrl.searchParams.append("key", API_KEY);

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from YouTube API" }),
        { 
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    
    // Transform the response to include only what we need
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      description: item.snippet.description
    }));

    return new Response(
      JSON.stringify({ videos }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in YouTube search:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
