import { A, useSearchParams } from "@solidjs/router";
import { Component, onMount } from "solid-js"

type Props = {
  songName: string;
  loopName: string;
  videoId: string;
  loopImage: {
    src: string;
    alt: string;
  };
  starting: {
    second: number;
    minute: number;
  };
  ending: {
    second: number;
    minute: number;
  };
}
export const LoopCard: Component<Props> = (props) => {
  const sParams = new URLSearchParams()
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
          alt={props.loopImage.alt} />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{props.songName}</h2>
        <p>Continue practicing {props.loopName}?</p>
        <div class="card-actions justify-end">
          <A href={`/practice/song?${sParams.toString()}`} class="btn btn-primary">Play</A>
        </div>
      </div>
    </div>
  )
}
