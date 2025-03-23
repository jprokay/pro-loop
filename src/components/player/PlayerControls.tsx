import { Component, Show } from "solid-js";
import { VideoState } from "~/types/player";

type PlayerControlsProps = {
  video: VideoState;
  playVideo: () => void;
  pauseVideo: () => void;
  toggleLoop: () => void;
};

const PlayerControls: Component<PlayerControlsProps> = (props) => {
  return (
    <div class="join flex flex-col sm:flex-row w-full justify-center gap-2 my-4">
      <div class="join-item w-full sm:w-1/2">
        <Show
          when={props.video.playing}
          fallback={
            <button
              class="btn btn-primary w-full py-6 text-lg"
              type="button"
              onClick={() => props.playVideo()}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                class="size-[1.2em]"
              >
                <g id="Play_1">
                  <path d="M6.562,21.94a2.5,2.5,0,0,1-2.5-2.5V4.56A2.5,2.5,0,0,1,7.978,2.5L18.855,9.939a2.5,2.5,0,0,1,0,4.12L7.977,21.5A2.5,2.5,0,0,1,6.562,21.94Zm0-18.884a1.494,1.494,0,0,0-.7.177,1.477,1.477,0,0,0-.8,1.327V19.439a1.5,1.5,0,0,0,2.35,1.235l10.877-7.44a1.5,1.5,0,0,0,0-2.471L7.413,3.326A1.491,1.491,0,0,0,6.564,3.056Z"></path>
                </g>
              </svg>
              Play
            </button>
          }
        >
          <button
            class="btn btn-primary w-full py-6 text-lg"
            type="button"
            onClick={() => props.pauseVideo()}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="size-[1.2em]"
            >
              <g id="Pause_1">
                <g>
                  <path d="M8.25,21.937H6.564a2.5,2.5,0,0,1-2.5-2.5V4.563a2.5,2.5,0,0,1,2.5-2.5H8.25a2.5,2.5,0,0,1,2.5,2.5V19.437A2.5,2.5,0,0,1,8.25,21.937ZM6.564,3.063a1.5,1.5,0,0,0-1.5,1.5V19.437a1.5,1.5,0,0,0,1.5,1.5H8.25a1.5,1.5,0,0,0,1.5-1.5V4.563a1.5,1.5,0,0,0-1.5-1.5Z"></path>
                  <path d="M17.436,21.937H15.75a2.5,2.5,0,0,1-2.5-2.5V4.563a2.5,2.5,0,0,1,2.5-2.5h1.686a2.5,2.5,0,0,1,2.5,2.5V19.437A2.5,2.5,0,0,1,17.436,21.937ZM15.75,3.063a1.5,1.5,0,0,0-1.5,1.5V19.437a1.5,1.5,0,0,0,1.5,1.5h1.686a1.5,1.5,0,0,0,1.5-1.5V4.563a1.5,1.5,0,0,0-1.5-1.5Z"></path>
                </g>
              </g>
            </svg>
            Pause
          </button>
        </Show>
      </div>

      <div class="join-item w-full sm:w-1/2">
        <button
          class={`btn btn-secondary w-full py-6 text-lg ${props.video.loop ? 'btn-active' : ''}`}
          type="button"
          onClick={() => props.toggleLoop()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class={`size-6 ${props.video.loop ? 'animate-spin-slow' : ''}`}
            style={props.video.loop ? "animation: spin 1s linear infinite;" : ""}
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {props.video.loop ? "Stop Loop" : "Start Loop"}
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;
