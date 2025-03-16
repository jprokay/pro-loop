import { useParams, useSearchParams } from "@solidjs/router"
import { liveQuery } from "dexie"
import { Show, Suspense, createEffect, from, onMount } from "solid-js"
import Player from "~/components/Player"
import { db } from "~/db/db"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {
  const [search] = useSearchParams()

  onMount(() => console.log(search.startMinute))
  return (
    <div class="w-full max-w-4xl">
      <Player fallback={<p>Foo</p>} videoUrl={String(search.videoId) || DEFAULT_URL} enableSave={true} startMinute={Number(search.startMinute) || 0} startSecond={Number(search.startSecond) || 0} endMinute={Number(search.endMinute) || 0} endSecond={Number(search.endSecond) || 0} />
    </div>
  )
}
