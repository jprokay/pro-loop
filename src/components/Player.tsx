import {
  Component,
  JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  For,
} from "solid-js";
import TagControls from "~/components/player/TagControls";

import YouTubePlayer from "youtube-player";
import { type YouTubePlayer as YTPlayer } from "youtube-player/dist/types";
import { createStore, produce } from "solid-js/store"
import { Notification, useNotification } from "~/components/Notification";
import { debounce } from "@solid-primitives/scheduled";
import { addLoop, updateLoop, updateTags } from "~/db/tables/loop";
import { db } from "~/db/db"
import SuperJSON from "superjson";

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
  userId?: string
  videoName?: string
  tags?: string[] // Add tags property
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


const Player: Component<Props> = (props) => {
  // Add a style element for the spinning animation
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(styleElement);

  // Clean up the style element when component unmounts
  onCleanup(() => {
    document.head.removeChild(styleElement);
  });
  const [player, setPlayer] = createSignal<YTPlayer | undefined>(undefined);
  const [slider, setSlider] = createSignal(1);
  const [saving, setSaving] = createSignal(false);
  const [saveSuccess, setSaveSuccess] = createSignal(false);
  const [loopId, setLoopId] = createSignal<number | undefined>(props.loopId)

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
    title: props.videoName,
    isVisible: true,
    tags: props.tags || [] // Initialize tags
  });

  const { show: showNotification, setShow: setShowNotification, notification, setNotification } = useNotification()

  onMount(() => {
    // Add meta tag to prevent zooming on input focus for mobile devices
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'viewport';
      newMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      document.head.appendChild(newMeta);
    }

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

  onCleanup(() => {
    // Restore original viewport meta tag when component unmounts
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
    }
    setPlayer(undefined)
  });

  onMount(async () => {
    const id = props.loopId

    if (id) {
      const loop = await db.loops.where('id').equals(id).first()
      setVideo(produce((video) => video.tags = loop?.tags || []))
    }
  })

  onMount(async () => {
    const videoId = parseUrl(props.videoUrl)

    if (props.videoName === undefined || props.videoName === "undefined" || props.videoName === "null") {
      try {
        const response = await fetch(`/api/videos/${videoId}/info`, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const parsed = await response.json();
        if (parsed && parsed.snippet && parsed.snippet.title) {
          setVideo(produce((v) => v.title = parsed.snippet.title));
        } else {
          console.warn("Video info response missing expected data structure:", parsed);
        }
      } catch (error) {
        console.error("Error fetching video info:", error);
        setVideo(produce((v) => v.title = "Unknown Title"));
      }
    }
  })

  async function changeVideo(url: string) {
    const videoId = parseUrl(url)

    if (!videoId) {
      return
    }

    player()?.loadVideoById(videoId, 0);
    let videoTitle = { snippet: { title: '---' } }

    try {
      const response = await fetch(`/api/videos/${videoId}/info`, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      videoTitle = await response.json();

      if (!videoTitle || !videoTitle.snippet || !videoTitle.snippet.title) {
        console.warn("Invalid video info response:", videoTitle);
        videoTitle = { snippet: { title: 'Unknown Title' } };
      }
    } catch (error) {
      console.error("Error fetching video info:", error);
      videoTitle = { snippet: { title: 'Error Loading Title' } };
    }

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
      v.title = videoTitle.snippet.title
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

  createEffect(async () => {
    const id = loopId()
    if (id) {
      await updateTags(id, video.tags)
    }
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
    setSaving(true);
    setSaveSuccess(false);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const id = formData.get("loopId")
    const videoId = formData.get("videoId") || video.videoId
    const startSecond = formData.get("startSeconds") || video.start.second
    const loopName = formData.get("loopName") || "Loop"
    const videoName = video.title
    const startMinute = formData.get("startMinutes") || video.start.minute
    const endSecond = formData.get("endSeconds") || video.end.second
    const endMinute = formData.get("endMinutes") || video.end.minute

    try {
      if (props.loopId) {
        await updateLoop(props.loopId, {
          videoId, startSecond, startMinute, endSecond, endMinute, loopName, videoName
        });
      } else {
        const newLoopId = await addLoop({
          videoId, startSecond, startMinute, endSecond, endMinute, loopName, videoName
        });

        setLoopId(newLoopId)
      }

      /**
       * TODO: Consider bringing this back later to sync loops across devices
       *
      const loopx = await db.loops.toArray();

      if (props.userId) {
        await fetch(`/api/users/${props.userId}/loops`, {
          method: "POST",
          body: SuperJSON.stringify({ "loops": loopx }),
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      */

      // Show success state
      setSaveSuccess(true);
      setNotification({
        type: "success",
        content: `Loop "${loopName}" saved successfully!`
      });
      setShowNotification(true);

      // Hide success after delay
      setTimeout(() => {
        setSaveSuccess(false);
        setShowNotification(false);
      }, 3000);

    } catch (err) {
      console.error(err);
      setNotification({
        type: "danger",
        content: "Failed to save loop. Please try again."
      });
      setShowNotification(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div class="w-full">
      <Notification it={notification} show={showNotification()} />
      <div class="w-full mb-4 border-2 border-gray-300 rounded-lg overflow-hidden">
        <div class="p-2 flex justify-between items-center">
          <h1 class="text-3xl font-mono text-primary-400 tracking-widest mb-1 truncate max-w-[70%] overflow-hidden text-ellipsis" title={video.title || "Loading video..."}>
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
                class="input w-full"
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
                class="input w-full"
                name="startMinutes"
                required={true}
                inputmode="numeric"
                min={0}
                value={video.start.minute}
                onInput={(e) => debouncedChangeStartMinute(e)}
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
                value={video.start.second}
                onInput={(e) => debouncedChangeStartSecond(e)}
                onTouchStart={(e) => e.target.removeAttribute('readonly')}
                onBlur={(e) => e.target.removeAttribute('readonly')}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class={`size-6 ${video.loop ? 'animate-spin-slow' : ''}`}
                style={video.loop ? "animation: spin 1s linear infinite;" : ""}
              >
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
                class="input w-full"
                name="endMinutes"
                required={true}
                inputmode="numeric"
                min={0}
                value={video.end.minute}
                onInput={(e) => debouncedChangeEndMinute(e)}
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
                value={video.end.second}
                onInput={(e) => debouncedChangeEndSecond(e)}
                onTouchStart={(e) => e.target.removeAttribute('readonly')}
                onBlur={(e) => e.target.removeAttribute('readonly')}
              />

              <div class="validator-hint hidden">Value must between 0 - 59</div>
            </div>

            <button type="button" class="btn btn-accent join-item w-1/5 md:w-1/5 py-3 text-base" onClick={setEndToNow}>Now</button>
          </div>
        </fieldset>



        {/* Add TagControls before speed controls */}
        <TagControls
          tags={video.tags || []}
          onAddTag={(tag) => setVideo("tags", tags => [...(tags || []), tag])}
          onRemoveTag={(tag) => setVideo("tags", tags => (tags || []).filter(t => t !== tag))}
        />

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
              <button
                class="btn btn-outline py-4 px-8 text-lg"
                type="submit"
                disabled={saving()}
              >
                <Show when={saving()} fallback="Update">
                  <span class="loading loading-spinner loading-sm mr-2"></span>
                  Updating...
                </Show>
              </button>
            </Show>
            <button
              class={`btn py-4 px-8 text-lg ${saveSuccess() ? 'btn-success' : 'btn-primary'}`}
              type="submit"
              disabled={saving()}
            >
              <Show
                when={saving()}
                fallback={
                  <Show when={saveSuccess()} fallback="Save">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Saved!
                  </Show>
                }
              >
                <span class="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              </Show>
            </button>
          </div>
        </Show>
      </form>
    </div>
  );
};

export default Player;
