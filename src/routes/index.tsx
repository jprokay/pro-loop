import { useParams } from "@solidjs/router"
import { liveQuery } from "dexie"
import { For, from, lazy, Show, Suspense, createSignal, createMemo } from "solid-js"
import { LoopCard } from "~/components/LoopCard"
import { db } from "~/db/db"
import CassetteTapeLoader from "~/components/CassetteTapeLoader"
const LazyPlayer = lazy(() => import("~/components/Player"))
const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'

const Player = () => {
  return (
    <div class="w-full max-w-4xl">
      <LazyPlayer fallback={null} videoUrl={DEFAULT_URL} enableSave={true} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
      </div>
    </div>

  )
}
const Loader = () => {
  return (
    <div class="flex justify-center items-center w-full h-screen">
      <CassetteTapeLoader />
    </div>
  )
}
export default function PracticePage() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const loopsObservable = liveQuery(() => db.loops.toArray())
  const loops = from(loopsObservable)
  
  const filteredLoops = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return loops();
    
    return loops()?.filter(loop => 
      (loop.videoName?.toLowerCase().includes(query) || 
       loop.loopName?.toLowerCase().includes(query))
    );
  });
  
  return (
    <div class="w-full min-w-full py-8 px-8 bg-base-300">
      <div class="mb-6 max-w-md mx-auto">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="Search loops by song or loop name..." 
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      <For each={filteredLoops()} fallback={<Loader />}>
        {(loop) => <LoopCard starting={{ second: loop.startSecond, minute: loop.startMinute }} ending={{ second: loop.endSecond, minute: loop.endMinute }} videoId={loop.videoId} loopName={loop.loopName} loopImage={{ alt: "foo", src: "" }} songName={loop.videoName} />}
      </For>
    </div>
  )
}
