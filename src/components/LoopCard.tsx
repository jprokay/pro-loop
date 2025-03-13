import { Component } from "solid-js"

type Props = {
  songName: string;
  loopName: string;
  videoId: string;
  loopImage: {
    src: string;
    alt: string;
  }
}
export const LoopCard: Component<Props> = (props) => {
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
          <button class="btn btn-primary">Play</button>
        </div>
      </div>
    </div>
  )
}
