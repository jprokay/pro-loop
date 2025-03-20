import type { APIEvent } from "@solidjs/start/server";
const API_KEY = process.env.GOOGLE_API_KEY;
export async function GET(event: APIEvent) {
  const videoId = event.params.id;
  const info = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(id,snippet(channelId,title,categoryId),statistics)&part=snippet,statistics`,
  );
  const data = await info.json();
  return data.items[0];
}
