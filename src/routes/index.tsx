import { useParams } from "@solidjs/router"
import { liveQuery } from "dexie"
import { For, from, lazy, Show, Suspense } from "solid-js"
import { LoopCard } from "~/components/LoopCard"
import { db } from "~/db/db"
const LazyPlayer = lazy(() => import("~/components/Player"))
const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'

const Player = () => {
  return (
    <div class="w-full max-w-4xl">
      <LazyPlayer fallback={null} videoUrl={DEFAULT_URL} enableSave={true} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>

  )
}
const Loader = () => {
  return (
    <div class="flex items-center">
      <span class="loading loading-ring loading-xs"></span>
      <span class="loading loading-ring loading-sm"></span>
      <span class="loading loading-ring loading-md"></span>
      <span class="loading loading-ring loading-lg"></span>
      <span class="loading loading-ring loading-xl"></span>
    </div>
  )
}
export default function PracticePage() {
  const loopsObservable = liveQuery(() => db.loops.toArray())
  const loops = from(loopsObservable)
  return (
    <div class="w-full min-w-full py-8 px-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 bg-base-300">
      <For each={loops()} fallback={<Loader />}>
        {(loop) => <LoopCard starting={{ second: loop.startSecond, minute: loop.startMinute }} ending={{ second: loop.endSecond, minute: loop.endMinute }} videoId={loop.videoId} loopName={loop.loopName} loopImage={{ alt: "foo", src: "" }} songName={loop.videoName || "---"} />}
      </For>
    </div>
  )
}
