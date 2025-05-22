import { useSearchParams } from "@solidjs/router";
import { Show, createMemo, createResource } from "solid-js";
import Player from "~/components/Player";
import VideoSearch from "~/components/VideoSearch";
import { useAuthContext } from "~/context/auth-context";

const DEFAULT_ID = 'nN120kCiVyQ';
function videoIdToUrl(videoId: string): string {
  return `https://youtube.com/watch?v=${videoId}`
}

// Import the YouTube API types from the info route
type YouTubeVideoItem = {
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
};

async function fetchInfo(videoId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`/api/videos/${videoId}/info`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const videoInfo = await response.json() as YouTubeVideoItem;

    if (!videoInfo || !videoInfo.snippet || !videoInfo.snippet.title) {
      console.warn("Invalid video info response:", videoInfo);
      return 'Unknown Title';
    } else {
      return videoInfo.snippet.title;
    }

  } catch (error) {
    console.error("Error fetching video info:", error);
    return undefined;
  }


}
export default function PracticePage() {
  const [search, setSearch] = useSearchParams();
  const [data] = createResource(() => String(search.videoId || DEFAULT_ID), fetchInfo)

  const clerk = useAuthContext()
  // Create stable props for the Player component
  const videoId = createMemo(() => String(search.videoId || DEFAULT_ID));
  const videoUrl = createMemo(() => videoIdToUrl(videoId()));
  const startMinute = createMemo(() => Number(search.startMinute) || 0);
  const startSecond = createMemo(() => Number(search.startSecond) || 0);
  const endMinute = createMemo(() => Number(search.endMinute) || 0);
  const endSecond = createMemo(() => Number(search.endSecond) || 0);
  const loopId = createMemo(() => Number(search.loopId) || undefined);
  const userId = createMemo(() => {
    if (clerk.latest) {
      const user = clerk().user
      if (user) {
        return user.id
      }
    }
    return undefined
  })

  function handleVideoSelect(videoId: string, title: string) {
    setSearch({ videoId, songName: title, startMinute: 0, startSecond: 0, endMinute: undefined, endSecond: undefined });
  }


  return (
    <div class="w-full max-w-4xl">
      <VideoSearch onSelectVideo={handleVideoSelect} />

      <div>
        <Show when={!data.loading} fallback={<p>Loading...</p>}>
          <Player
            loopId={loopId()}
            videoName={data()}
            userId={userId()}
            fallback={<p>Loading player...</p>}
            videoUrl={videoUrl()}
            enableSave={true}
            startMinute={startMinute()}
            startSecond={startSecond()}
            endMinute={endMinute()}
            endSecond={endSecond()}
          />
        </Show>
      </div>
    </div>
  );
}
