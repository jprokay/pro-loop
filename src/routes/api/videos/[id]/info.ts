import type { APIEvent } from "@solidjs/start/server";
import SuperJSON from "superjson";
import { storage } from "~/kv";
import { rateLimit } from "~/utils/rate-limiter";

// YouTube API response types
interface YouTubeVideoResponse {
  items?: YouTubeVideoItem[];
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
    status: string;
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    channelId: string;
    title: string;
    categoryId: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

const CACHE_TTL = 60 * 60 * 24 * 7; // 1 week in seconds

function videoInfoKey(videoId: string): string {
  return `video-info/${videoId}`;
}

export async function GET(event: APIEvent) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  // Apply rate limiting - 100 requests per hour per client
  const rateLimitResponse = await rateLimit(event, {
    limit: 100,
    windowInSeconds: 60 * 60, // 1 hour
    identifier: "youtube-video-info",
  });

  // If rate limited, return the response
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const videoId = event.params.id;

  try {
    const cachedData = await storage.get(videoInfoKey(videoId));
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
      });
    }
  } catch {
  } finally {
    // If not in cache, fetch from YouTube API
    const info = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(id,snippet(channelId,title,categoryId),statistics)&part=snippet,statistics`,
    );
    const data = await info.json() as YouTubeVideoResponse;
    if ("items" in data && data.items?.length) {
      const videoInfo: YouTubeVideoItem = data.items[0];
      console.log("Video info: ", videoInfo);

      if (videoInfo) {
        // Store in cache for future requests
        await storage.set(videoInfoKey(videoId), videoInfo, {
          expirationTtl: CACHE_TTL,
        });
      }

      return new Response(JSON.stringify(videoInfo), { status: 200 });
    } else {
      return new Response(undefined, { status: 400 });
    }
  }
}
