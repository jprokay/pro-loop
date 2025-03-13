import { useParams } from "@solidjs/router"
import Player from "~/components/Player"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {

  return (
    <div class="w-full max-w-4xl">
      <Player fallback={null} videoUrl={DEFAULT_URL} enableSave={true} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>
  )
}
