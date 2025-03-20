import { useSearchParams } from "@solidjs/router";
import { Suspense, createEffect, createMemo, createSignal, onMount } from "solid-js";
import Player from "~/components/Player";
import { useAuthContext } from "~/context/auth-context";

const DEFAULT_ID = 'nN120kCiVyQ';
function videoIdToUrl(videoId: string): string {
  return `https://youtube.com/watch?v=${videoId}`
}

export default function PracticePage() {
  const [search] = useSearchParams();

  const clerk = useAuthContext()
  // Create stable props for the Player component
  const videoUrl = createMemo(() => videoIdToUrl(String(search.videoId || DEFAULT_ID)));
  const songName = createMemo(() => search.songName ? String(search.songName) : undefined);
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


  return (
    <div class="w-full max-w-4xl">
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
