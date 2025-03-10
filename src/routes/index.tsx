import { useParams } from "@solidjs/router"
import Player from "~/components/Player"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {

  return (
    <div class="w-full min-w-full py-8 px-4 sm:px-8 xl:px-48 lg:px-24 max-w-4xl bg-base-300">
      <Player fallback={null} videoUrl={DEFAULT_URL} enableSave={false} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>
  )
}
