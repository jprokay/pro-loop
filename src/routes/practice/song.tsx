import { useParams, useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import Player from "~/components/Player";

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ';

export default function PracticePage() {
  const [search] = useSearchParams();
  const [isLoaded, setIsLoaded] = createSignal(false);
  
  // Create stable props for the Player component
  const videoUrl = createMemo(() => String(search.videoId) || DEFAULT_URL);
  const startMinute = createMemo(() => Number(search.startMinute) || 0);
  const startSecond = createMemo(() => Number(search.startSecond) || 0);
  const endMinute = createMemo(() => Number(search.endMinute) || 0);
  const endSecond = createMemo(() => Number(search.endSecond) || 0);
  
  onMount(() => {
    console.log("Component mounted with startMinute:", search.startMinute);
    setIsLoaded(true);
    
    // For debugging
    console.log("Search params:", {
      videoId: search.videoId,
      startMinute: search.startMinute,
      startSecond: search.startSecond,
      endMinute: search.endMinute,
      endSecond: search.endSecond
    });
  });
  
  createEffect(() => {
    if (isLoaded()) {
      console.log("Player should be visible now");
    }
  });

  return (
    <div class="w-full max-w-4xl">
      <div>
        {isLoaded() ? (
          <Player 
            fallback={<p>Loading player...</p>} 
            videoUrl={videoUrl()} 
            enableSave={true} 
            startMinute={startMinute()} 
            startSecond={startSecond()} 
            endMinute={endMinute()} 
            endSecond={endSecond()} 
          />
        ) : (
          <p>Initializing player...</p>
        )}
      </div>
    </div>
  );
}
