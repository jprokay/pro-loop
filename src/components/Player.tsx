import {
  Component,
  JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import YouTubePlayer from "youtube-player";
import { type YouTubePlayer as YTPlayer } from "youtube-player/dist/types";
import { createStore, produce } from "solid-js/store"
import { Notification, useNotification } from "~/components/Notification";
import { debounce } from "@solid-primitives/scheduled";
import { addLoop, updateLoop } from "~/db/tables/loop";

type Props = {
  enableSave: boolean
  fallback: JSX.Element
  videoUrl: string
  startMinute: number
  startSecond: number
  endMinute: number
  endSecond: number
  loopId?: number
  loopName?: string
}

function parseBrowserBarUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  }
  return undefined
}


function parseShareUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtu\.be\/([^?]+)/;

  const match = url.match(regex);

  if (match) {
    return match[1];
  } return undefined
}

function parseUrl(url: string): string {
  return parseBrowserBarUrl(url) || parseShareUrl(url) || url
}

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'

const Player: Component<Props> = (props) => {
  const [player, setPlayer] = createSignal<YTPlayer>();
  const [slider, setSlider] = createSignal(1);

  const [video, setVideo] = createStore({
    start: {
      minute: Number(props.startMinute || 0),
      second: Number(props.startSecond || 0),
    },
    end: {
      minute: Number(props.endMinute || 0),
      second: Number(props.endSecond || 0),
    },
    videoId: parseUrl(props.videoUrl),
    videoUrl: props.videoUrl,
    loop: false,
    playing: false,
    playbackRate: 1.0,
    duration: 0,
    name: undefined,
    title: "Boys",
    isVisible: true
  });

  const { show: showNotification, setShow: setShowNotification, notification, setNotification } = useNotification()

  onMount(() => {
    const startSec = Number(props.startMinute || 0) * 60 + Number(props.startSecond || 0)

    const ytPlayer = YouTubePlayer("player", {
      videoId: video.videoId,
      width: undefined,
      height: undefined,
      playerVars: {
        autoplay: 0,
        enablejsapi: 1,
        start: startSec
      },
    });

    setPlayer(ytPlayer);

    // Get video title
  });

  function changeVideo(url: string) {
    const videoId = parseUrl(url)

    if (!videoId) {
      return
    }
    player()?.loadVideoById(videoId, 0);

    setVideo(produce((v) => {
      v.start = {
        second: 0,
        minute: 0
      }
      v.end = {
        second: 0,
        minute: 0
      }
      v.duration = 0
      v.videoId = videoId
      v.videoUrl = url
      v.title = "" // Reset title until new one is loaded
    }))

  }

  const timer = setInterval(() => {
    player()?.getDuration().then((duration) => {
      if (duration > 0 && video.end.minute <= 0 && video.end.second <= 0) {

        const endMinutes = Math.floor(duration / 60);
        const endSeconds = Math.round(duration % 60);

        setVideo("duration", duration)
        setVideo("end", ({
          minute: endMinutes,
          second: endSeconds,
        }));
      }
    })

  }, 500)


  const loopInterval = setInterval(async () => {
    const endAsSeconds = video.end.minute * 60 + video.end.second

    const startAsSeconds = video.start.minute * 60 + video.start.second;

    const currTime = await player()?.getCurrentTime();
    if (currTime && currTime > endAsSeconds) {
      if (video.loop) {
        await player()?.seekTo(startAsSeconds, true);
      } else {
        player()?.stopVideo();
      }
    }
  }, 1000);

  function changeStartMinute(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const minute = Number(input.value)
    setVideo("start", (start) => ({ ...start, minute })
    )
    changeStart(minute, video.start.second)
  }

  function changeStartSecond(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const second = Number(input.value)
    setVideo("start", (start) => ({ ...start, second: second })
    )
    changeStart(video.start.minute, second)
  }

  function changeEndMinute(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const minute = Number(input.value)
    setVideo("end", (end) => ({ ...end, minute })
    )
  }

  function changeEndSecond(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const second = Number(input.value)
    setVideo("end", (end) => ({ ...end, second })
    )
  }

  const debouncedChangeStartMinute = debounce(changeStartMinute, 500)
  const debouncedChangeStartSecond = debounce(changeStartSecond, 500)
  const debouncedChangeEndMinute = debounce(changeEndMinute, 500)
  const debouncedChangeEndSecond = debounce(changeEndSecond, 500)

  onCleanup(() => {
    clearInterval(loopInterval)
    clearInterval(timer)
    debouncedChangeStartMinute.clear()
    debouncedChangeStartSecond.clear()
    debouncedChangeEndMinute.clear()
    debouncedChangeEndSecond.clear()
  })

  createEffect(() => {
    player()?.setPlaybackRate(video.playbackRate);
  })

  function playVideo() {
    player()?.playVideo();
    setVideo("playing", true)
  }

  type TimePiece = {
    minute: number,
    second: number
  }
  async function getCurrentTime(): Promise<TimePiece | undefined> {
    const currTime = await player()?.getCurrentTime();
    if (currTime) {
      const minute = Math.floor(currTime / 60);
      const second = Math.floor(currTime - (minute * 60))

      return { minute, second }
    }
    return undefined
  }

  async function setStartToNow() {
    const currTime = await getCurrentTime()
    if (currTime) {

      setVideo("start", ({
        minute: currTime.minute,
        second: currTime.second
      }))
    }
  }

  async function setEndToNow() {
    const currTime = await getCurrentTime()
    if (currTime) {

      setVideo("end", ({
        minute: currTime.minute,
        second: currTime.second
      }))
    }
  }

  function pauseVideo() {
    player()?.pauseVideo();
    setVideo("playing", false)
  }

  function toggleVideoVisibility() {
    setVideo("isVisible", !video.isVisible);
  }

  function changeStart(startMinute: number, startSecond: number) {
    const startAsSeconds = startMinute * 60 + startSecond;
    player()?.seekTo(startAsSeconds, true);

    if (!video.playing) {
      player()?.pauseVideo();
    }
  }


  async function submitForm(e: Event): Promise<void> {
    e.preventDefault();
    console.log("event: ", e)
    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);
    console.log("formData: ", formData)
    const id = formData.get("loopId")
    const videoId = formData.get("videoId") || video.videoId
    const startSecond = formData.get("startSecond") || 0
    const loopName = formData.get("loopName") || "Loop"
    const startMinute = formData.get("startMinute") || 0
    const endSecond = formData.get("endSecond") || video.end.second
    const endMinute = formData.get("endMinute") || video.end.minute

    if (props.loopId) {
      updateLoop(props.loopId, { videoId, startSecond, startMinute, endSecond, endMinute, loopName })
    }

    addLoop({ videoId, startSecond, startMinute, endSecond, endMinute, loopName })
  }

  return (
    <div class="w-full">
      <Notification it={notification} show={showNotification()} />
      <div class="w-full mb-4 border-2 border-gray-300 rounded-lg overflow-hidden">
        <div class="p-2 flex justify-between items-center">
          <h1 class="text-3xl font-mono text-primary-400 tracking-widest mb-1">
            {video.title || "Loading video..."}
          </h1>
          <button
            type="button"
            class="btn btn-sm btn-dashed btn-primary"
            onClick={toggleVideoVisibility}
          >
            {video.isVisible ? (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>Hide Video</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>Show Video</>
            )}
          </button>
        </div>
        <div class={`w-full ${video.isVisible ? 'aspect-video' : 'h-0'} transition-all duration-300`}>
          <div id="player" class="w-full h-full"></div>
        </div>
      </div>

      <form onSubmit={submitForm} class="w-full space-y-4">
        <Show when={props.loopId}>
          <div id="loop-id" class="field">
            <div class="control disabled">
              <input id="loop-id" class="input" type="hidden" name="loopId" value={props.loopId} readonly={true} />
            </div>
            <label class="label help">Loop ID</label>
          </div>
        </Show>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Video URL</legend>
          <div class="join w-full flex flex-wrap md:flex-nowrap">
            <div class="join-item w-full md:w-4/5">
              <input
                class="input validator w-full"
                type="url"
                name="videoUrl"
                inputmode="url"
                required={true}
                placeholder="https://"
                pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                onInput={(e) => {
                  changeVideo(e.target.value)
                }}
                value={video.videoUrl}
              />

              <div class="validator-hint hidden">Enter valid email address</div>
            </div>
            <button type="button" class="btn btn-accent join-item w-full md:w-1/5 py-3 text-base" onClick={() => setVideo("videoUrl", "")}>Clear</button>
            <input class="input" name="videoId" value={video.videoId} readonly={true} type="hidden" />
          </div>


        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Loop Name</legend>
          <input class="input w-full" type="text" name="loopName" value={props.loopName || "Chorus"} />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Start Minute : Start Second</legend>
          <div class="join w-full flex flex-wrap md:flex-nowrap">
            <div class="join-item w-2/5 md:w-[40%]">
              <input
                type="number"
                class="input validator w-full"
                name="startMinutes"
                required={true}
                inputmode="numeric"
                min={0}
                value={video.start.minute}
                onInput={(e) => debouncedChangeStartMinute(e)}
              />

              <div class="validator-hint hidden">Value must be greater than or equal to 0</div>
            </div>
            <div class="join-item w-2/5 md:w-[40%]">
              <input
                type="number"
                class="input validator w-full"
                name="startSeconds"
                inputmode="numeric"
                required={true}
                min={0}
                max={59}
                value={video.start.second}
                onInput={(e) => debouncedChangeStartSecond(e)}
              />

              <div class="validator-hint hidden">Value must between 0 - 59</div>
            </div>

            <button type="button" class="btn btn-accent join-item w-1/5 md:w-1/5 py-3 text-base" onClick={setStartToNow}>Now</button>
          </div>

        </fieldset>
        <div class="join flex flex-col sm:flex-row w-full justify-center gap-2 my-4">
          <div class="join-item w-full sm:w-1/2">
            <Show
              when={video.playing}
              fallback={
                <button
                  class="btn btn-primary w-full py-6 text-lg"
                  type="button"
                  onClick={() => playVideo()}
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
                onClick={() => pauseVideo()}
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
              class={`btn btn-secondary w-full py-6 text-lg ${video.loop ? 'btn-active' : ''}`}
              type="button"
              onClick={() => setVideo("loop", (loop) => !loop)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {video.loop ? "Stop Loop" : "Start Loop"}
            </button>
          </div>
        </div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">End Minute : End Second</legend>
          <div class="join w-full flex flex-wrap md:flex-nowrap">
            <div class="join-item w-2/5 md:w-[40%]">
              <input
                type="number"
                class="input validator w-full"
                name="endMinutes"
                required={true}
                inputmode="numeric"
                min={0}
                value={video.end.minute}
                onInput={(e) => debouncedChangeEndMinute(e)}
              />

              <div class="validator-hint hidden">Value must be greater than or equal to 0</div>
            </div>
            <div class="join-item w-2/5 md:w-[40%]">
              <input
                type="number"
                class="input validator w-full"
                name="endSeconds"
                inputmode="numeric"
                required={true}
                min={0}
                max={59}
                value={video.end.second}
                onInput={(e) => debouncedChangeEndSecond(e)}
              />

              <div class="validator-hint hidden">Value must between 0 - 59</div>
            </div>

            <button type="button" class="btn btn-accent join-item w-1/5 md:w-1/5 py-3 text-base" onClick={setEndToNow}>Now</button>
          </div>
        </fieldset>



        <div class="w-full md:max-w-md lg:max-w-lg mx-auto my-4">
          <input class="range w-full" type="range" name="playbackRate" min="0.5" max="1.5" step="0.05"
            value={video.playbackRate}
            onInput={(e) => setVideo("playbackRate", Number(e.target.value))}
            list="rates"
            id="rateRange" />
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
          <button type="button" class="btn btn-accent btn-outline join-item py-4 px-6 text-lg" onClick={() => setVideo("playbackRate", (rate) => Math.max(rate - 0.05, 0.5))}>-5%</button>
          <output id="value" class="join-item text-center min-w-24 text-lg">Speed: {Math.round(video.playbackRate * 100)}%</output>
          <button type="button" class="btn btn-accent btn-outline join-item py-4 px-6 text-lg" onClick={() => setVideo("playbackRate", (rate) => Math.min(rate + 0.05, 1.5))}>+5%</button>
        </div>
        <Show when={props.enableSave} fallback={props.fallback}>
          <div class="flex justify-center gap-4 mt-6">
            <Show when={props.loopId}>
              <button class="btn btn-outline py-4 px-8 text-lg" type="submit">Update</button>
            </Show>
            <button class="btn btn-primary py-4 px-8 text-lg" type="submit">Save</button>
          </div>
        </Show>
      </form>
    </div>
  );
};

export default Player;
