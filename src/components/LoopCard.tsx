import { A, useSearchParams } from "@solidjs/router";
import { Component, For, onMount, createSignal } from "solid-js"
import Tag from "./Tag";

type Props = {
  loopId: string;
  songName: string;
  loopName: string;
  videoId: string;
  starting: {
    second: number;
    minute: number;
  };
  ending: {
    second: number;
    minute: number;
  };
  tags: string[]
}
export const LoopCard: Component<Props> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const sParams = new URLSearchParams()
  sParams.append("loopId", props.loopId)
  sParams.append("loopName", props.loopName)
  sParams.append("songName", props.songName)
  sParams.append("videoId", props.videoId)
  sParams.append("startSecond", String(props.starting.second))
  sParams.append("startMinute", String(props.starting.minute))
  sParams.append("endSecond", String(props.ending.second))
  sParams.append("endMinute", String(props.ending.minute))

  // Improved image with SEO, accessibility and CLS prevention
  return (
    <div class="card bg-base-100 image-full max-w-96 shadow-sm">
      <figure>
        <div 
          class={`bg-gray-200 ${!imageLoaded() ? 'animate-pulse' : 'hidden'} w-full h-full absolute top-0 left-0`}
          style="aspect-ratio: 16/9;"
          aria-hidden="true"
        ></div>
        <img
          src={`https://img.youtube.com/vi/${props.videoId}/sddefault.jpg`}
          alt={`YouTube thumbnail for ${props.songName}`}
          height="360"
          width="640"
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to mqdefault if sddefault fails
            e.currentTarget.src = `https://img.youtube.com/vi/${props.videoId}/mqdefault.jpg`;
          }}
          class="w-full h-auto object-cover"
        />
      </figure>
      <div class="card-body">
        <div class="flex flex-wrap gap-2">
          <For each={props.tags}>
            {(tag) => <Tag name={tag} />}
          </For>
        </div>

        <h2 class="card-title">{props.songName}</h2>
        <p>Continue practicing <strong>{props.loopName}</strong></p>

        <div class="card-actions justify-end">
          <A href={`/practice/song?${sParams.toString()}`} class="btn btn-secondary btn-sm md:btn-md
">Play</A>
        </div>
      </div>
    </div>
  )
}
