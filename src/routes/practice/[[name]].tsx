import { useParams } from "@solidjs/router"
import Player from "~/components/Player"

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'
export default function PracticePage() {
  const params = useParams()

  return (
    <div class="w-full max-w-4xl">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-sky-700 mb-2">Practice Mode</h1>
        <div class="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-sky-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
          <p class="text-gray-600 italic">Master your music with loop-based learning</p>
        </div>
      </div>
      <Player videoUrl={DEFAULT_URL} enableSave={false} startMinute={0} startSecond={0} endMinute={0} endSecond={0} />
    </div>
  )
}
