import { A, useSearchParams } from "@solidjs/router";
import { Component, For, onMount } from "solid-js"
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
  const sParams = new URLSearchParams()
  sParams.append("loopId", props.loopId)
  sParams.append("loopName", props.loopName)
  sParams.append("songName", props.songName)
  sParams.append("videoId", props.videoId)
  sParams.append("startSecond", String(props.starting.second))
  sParams.append("startMinute", String(props.starting.minute))
  sParams.append("endSecond", String(props.ending.second))
  sParams.append("endMinute", String(props.ending.minute))

  return (
    <div class="card bg-base-100 image-full max-w-96 shadow-sm">
      <figure>
        <img
          src={`https://img.youtube.com/vi/${props.videoId}/sddefault.jpg`}
          alt={props.songName} />
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
