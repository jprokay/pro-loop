import { useParams } from "@solidjs/router"
import Player from "~/components/Player"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {
  const params = useParams()

  return (
    <div class="w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-sky-700 mb-6">Practice</h1>
      <Player videoUrl={DEFAULT_URL} enableSave={false} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>
  )
}
