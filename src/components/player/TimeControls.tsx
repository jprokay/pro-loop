import { Component, InputEvent } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { VideoState } from "~/types/player";

type TimeControlsProps = {
  video: VideoState;
  setStartToNow: () => void;
  setEndToNow: () => void;
  onStartMinuteChange: (e: InputEvent) => void;
  onStartSecondChange: (e: InputEvent) => void;
  onEndMinuteChange: (e: InputEvent) => void;
  onEndSecondChange: (e: InputEvent) => void;
};

const TimeControls: Component<TimeControlsProps> = (props) => {
  const debouncedStartMinute = debounce(props.onStartMinuteChange, 500);
  const debouncedStartSecond = debounce(props.onStartSecondChange, 500);
  const debouncedEndMinute = debounce(props.onEndMinuteChange, 500);
  const debouncedEndSecond = debounce(props.onEndSecondChange, 500);

  return (
    <>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Start Minute : Start Second</legend>
        <div class="join w-full flex flex-wrap md:flex-nowrap">
          <div class="join-item w-2/5 md:w-[40%]">
            <input
              type="number"
              class="input w-full"
              name="startMinutes"
              required={true}
              inputmode="numeric"
              min={0}
              value={props.video.start.minute}
              onInput={(e) => debouncedStartMinute(e)}
              onFocus={(e) => e.target.setAttribute('readonly', 'readonly')}
              onTouchStart={(e) => e.target.removeAttribute('readonly')}
              onBlur={(e) => e.target.removeAttribute('readonly')}
            />
            <div class="validator-hint hidden">Value must be greater than or equal to 0</div>
          </div>
          <div class="join-item w-2/5 md:w-[40%]">
            <input
              type="number"
              class="input w-full"
              name="startSeconds"
              inputmode="numeric"
              required={true}
              min={0}
              max={59}
              value={props.video.start.second}
              onInput={(e) => debouncedStartSecond(e)}
              onFocus={(e) => e.target.setAttribute('readonly', 'readonly')}
              onTouchStart={(e) => e.target.removeAttribute('readonly')}
              onBlur={(e) => e.target.removeAttribute('readonly')}
            />
            <div class="validator-hint hidden">Value must between 0 - 59</div>
          </div>
          <button 
            type="button" 
            class="btn btn-accent join-item w-1/5 md:w-1/5 py-3 text-base" 
            onClick={props.setStartToNow}
          >
            Now
          </button>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">End Minute : End Second</legend>
        <div class="join w-full flex flex-wrap md:flex-nowrap">
          <div class="join-item w-2/5 md:w-[40%]">
            <input
              type="number"
              class="input w-full"
              name="endMinutes"
              required={true}
              inputmode="numeric"
              min={0}
              value={props.video.end.minute}
              onInput={(e) => debouncedEndMinute(e)}
              onFocus={(e) => e.target.setAttribute('readonly', 'readonly')}
              onTouchStart={(e) => e.target.removeAttribute('readonly')}
              onBlur={(e) => e.target.removeAttribute('readonly')}
            />
            <div class="validator-hint hidden">Value must be greater than or equal to 0</div>
          </div>
          <div class="join-item w-2/5 md:w-[40%]">
            <input
              type="number"
              class="input w-full"
              name="endSeconds"
              inputmode="numeric"
              required={true}
              min={0}
              max={59}
              value={props.video.end.second}
              onInput={(e) => debouncedEndSecond(e)}
              onFocus={(e) => e.target.setAttribute('readonly', 'readonly')}
              onTouchStart={(e) => e.target.removeAttribute('readonly')}
              onBlur={(e) => e.target.removeAttribute('readonly')}
            />
            <div class="validator-hint hidden">Value must between 0 - 59</div>
          </div>
          <button 
            type="button" 
            class="btn btn-accent join-item w-1/5 md:w-1/5 py-3 text-base" 
            onClick={props.setEndToNow}
          >
            Now
          </button>
        </div>
      </fieldset>
    </>
  );
};

export default TimeControls;
