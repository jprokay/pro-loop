import { useSearchParams } from "@solidjs/router";
import { Suspense, createMemo, createSignal } from "solid-js";
import Player from "~/components/Player";
import VideoSearch from "~/components/VideoSearch";
import { useAuthContext } from "~/context/auth-context";

const DEFAULT_ID = 'nN120kCiVyQ';
function videoIdToUrl(videoId: string): string {
  return `https://youtube.com/watch?v=${videoId}`
}

export default function PracticePage() {
  const [search, setSearch] = useSearchParams();
  const [currentVideoId, setCurrentVideoId] = createSignal(search.videoId || DEFAULT_ID);
  const [currentVideoTitle, setCurrentVideoTitle] = createSignal(search.songName || "");

  const clerk = useAuthContext()
  // Create stable props for the Player component
  const videoUrl = createMemo(() => videoIdToUrl(String(currentVideoId())));
  const songName = createMemo(() => currentVideoTitle() || undefined);
  const startMinute = createMemo(() => Number(search.startMinute) || 0);
  const startSecond = createMemo(() => Number(search.startSecond) || 0);
  const endMinute = createMemo(() => Number(search.endMinute) || 0);
  const endSecond = createMemo(() => Number(search.endSecond) || 0);
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
    setCurrentVideoId(videoId);
    setCurrentVideoTitle(title);
    setSearch({ videoId, songName: title });
  }

  return (
    <div class="w-full max-w-4xl">
      <VideoSearch onSelectVideo={handleVideoSelect} />
      
      <div>
        <Suspense>
          <Player
            videoName={songName()}
            userId={userId()}
            fallback={<p>Loading player...</p>}
            videoUrl={videoUrl()}
            enableSave={true}
            startMinute={startMinute()}
            startSecond={startSecond()}
            endMinute={endMinute()}
            endSecond={endSecond()}
          />
        </Suspense>
      </div>
    </div>
  );
}
