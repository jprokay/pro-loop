import { Component } from "solid-js";
import { VideoState } from "~/types/player";

type SpeedControlsProps = {
  video: VideoState;
  onPlaybackRateChange: (rate: number) => void;
};

const SpeedControls: Component<SpeedControlsProps> = (props) => {
  return (
    <>
      <div class="w-full md:max-w-md lg:max-w-lg mx-auto my-4">
        <input 
          class="range w-full" 
          type="range" 
          name="playbackRate" 
          min="0.5" 
          max="1.5" 
          step="0.05"
          value={props.video.playbackRate}
          onInput={(e) => props.onPlaybackRateChange(Number(e.target.value))}
          list="rates"
          id="rateRange" 
        />
        <div class="flex justify-between px-2.5 mt-2 text-xs">
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
        </div>
        <div class="flex justify-between px-2.5 mt-2 text-xs">
          <span>50%</span>
          <span>70%</span>
          <span>90%</span>
          <span>100%</span>
          <span>110%</span>
          <span>130%</span>
          <span>150%</span>
        </div>
      </div>

      <div class="join gap-2 flex flex-wrap md:flex-nowrap justify-center items-center my-4">
        <button 
          type="button" 
          class="btn btn-accent btn-outline join-item py-4 px-6 text-lg" 
          onClick={() => props.onPlaybackRateChange(Math.max(props.video.playbackRate - 0.05, 0.5))}
        >
          -5%
        </button>
        <output id="value" class="join-item text-center min-w-24 text-lg">
          Speed: {Math.round(props.video.playbackRate * 100)}%
        </output>
        <button 
          type="button" 
          class="btn btn-accent btn-outline join-item py-4 px-6 text-lg" 
          onClick={() => props.onPlaybackRateChange(Math.min(props.video.playbackRate + 0.05, 1.5))}
        >
          +5%
        </button>
      </div>
    </>
  );
};

export default SpeedControls;
