import { useParams } from "@solidjs/router"
import Player from "~/components/Player"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {
  const params = useParams()

  return (
    <div class="w-full max-w-4xl">
      <div class="mb-8 text-center">
        <div class="bg-black rounded-lg p-4 inline-block shadow-lg">
          <h1 class="text-3xl font-mono text-green-400 tracking-widest mb-1 uppercase">Now Playing...</h1>
          <div class="h-1 w-16 bg-green-400 mx-auto rounded-full"></div>
        </div>
      </div>
      <Player videoUrl={DEFAULT_URL} enableSave={false} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>
  )
}
