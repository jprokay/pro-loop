import type { APIEvent } from "@solidjs/start/server";
import SuperJSON from "superjson";
import { storage } from "~/kv";
import { rateLimit } from "~/utils/rate-limiter";

const API_KEY = process.env.GOOGLE_API_KEY;
const CACHE_TTL = 60 * 60 * 24 * 7; // 1 week in seconds

function videoInfoKey(videoId: string): string {
  return `video-info/${videoId}`;
}

export async function GET(event: APIEvent) {
  // Apply rate limiting - 100 requests per hour per client
  const rateLimitResponse = await rateLimit(event, {
    limit: 100,
    windowInSeconds: 60 * 60, // 1 hour
    identifier: "youtube-video-info",
  });
  console.log("RL Response: ", rateLimitResponse);

  // If rate limited, return the response
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const videoId = event.params.id;

  // Try to get from cache first
  console.log("VideoID: ", videoId);
  try {
    const cachedData = await storage.get(videoInfoKey(videoId));
    if (cachedData) {
      console.log(`Cache hit for video ${videoId}`);
      return SuperJSON.parse(cachedData.toString());
    }
  } catch {
    console.log(`Cache miss for video ${videoId}, fetching from YouTube API`);
    // If not in cache, fetch from YouTube API
    const info = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(id,snippet(channelId,title,categoryId),statistics)&part=snippet,statistics`,
    );
    console.log("fetching: ", info);
    const data = await info.json();
    const videoInfo = data.items[0];
    console.log("Video info: ", videoInfo);

    if (videoInfo) {
      // Store in cache for future requests
      await storage.set(videoInfoKey(videoId), SuperJSON.stringify(videoInfo), {
        expirationTtl: CACHE_TTL,
      });
    }

    return videoInfo;
  }
}
