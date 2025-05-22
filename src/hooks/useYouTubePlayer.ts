import { createSignal, createStore, onCleanup, onMount, produce } from "solid-js";
import YouTubePlayer from "youtube-player";
import { type YouTubePlayer as YTPlayer } from "youtube-player/dist/types";
import { TimePiece, VideoState } from "~/types/player";

// Add YouTube API type to window
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function parseBrowserBarUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  }
  return undefined;
}

function parseShareUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtu\.be\/([^?]+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  }
  return undefined;
}

export function parseUrl(url: string): string {
  return parseBrowserBarUrl(url) || parseShareUrl(url) || url;
}

export type UseYouTubePlayerOptions = {
  initialStartMinute?: number;
  initialStartSecond?: number;
  initialEndMinute?: number;
  initialEndSecond?: number;
  initialVideoName?: string;
  initialTags?: string[]; // Add this for initial tags
};

export function useYouTubePlayer(videoUrl: string, options: UseYouTubePlayerOptions = {}) {
  const [player, setPlayer] = createSignal<YTPlayer>();
  const [saving, setSaving] = createSignal(false);
  const [saveSuccess, setSaveSuccess] = createSignal(false);

  const [video, setVideo] = createStore<VideoState>({
    start: {
      minute: Number(options.initialStartMinute || 0),
      second: Number(options.initialStartSecond || 0),
    },
    end: {
      minute: Number(options.initialEndMinute || 0),
      second: Number(options.initialEndSecond || 0),
    },
    videoId: parseUrl(videoUrl),
    videoUrl: videoUrl,
    loop: false,
    playing: false,
    playbackRate: 1.0,
    duration: 0,
    name: undefined,
    title: options.initialVideoName,
    isVisible: true,
    tags: options.initialTags || [], // Initialize tags
  });

  onMount(() => {
    try {
      console.log("Mounting YouTube player with videoId:", video.videoId);
      
      // Check if YouTube iframe API is loaded
      if (typeof window !== 'undefined' && !window.YT) {
        console.warn("YouTube iframe API not loaded yet");
        
        // You could add a script tag to load it manually if needed
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
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

      const startSec = Number(options.initialStartMinute || 0) * 60 + Number(options.initialStartSecond || 0);
      console.log("Starting at second:", startSec);

      // Check if player element exists
      const playerElement = document.getElementById("player");
      if (!playerElement) {
        console.error("Player element not found in DOM");
        return;
      }

      const ytPlayer = YouTubePlayer("player", {
        videoId: video.videoId,
        width: undefined,
        height: undefined,
        playerVars: {
          autoplay: 0,
          enablejsapi: 1,
          start: startSec,
        },
      });

      console.log("YouTube player initialized");
      setPlayer(ytPlayer);
    } catch (error) {
      console.error("Error initializing YouTube player:", error);
    }
  });

  onCleanup(() => {
    // Restore original viewport meta tag when component unmounts
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
    }
  });

  // Set up intervals for loop functionality and duration detection
  const timer = setInterval(() => {
    player()?.getDuration().then((duration) => {
      if (duration > 0 && video.end.minute <= 0 && video.end.second <= 0) {
        const endMinutes = Math.floor(duration / 60);
        const endSeconds = Math.round(duration % 60);

        setVideo("duration", duration);
        setVideo("end", {
          minute: endMinutes,
          second: endSeconds,
        });
      }
    });
  }, 500);

  const loopInterval = setInterval(async () => {
    const endAsSeconds = video.end.minute * 60 + video.end.second;
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

  onCleanup(() => {
    clearInterval(loopInterval);
    clearInterval(timer);
  });

  // Player control functions
  function playVideo() {
    player()?.playVideo();
    setVideo("playing", true);
  }

  function pauseVideo() {
    player()?.pauseVideo();
    setVideo("playing", false);
  }

  function toggleVideoVisibility() {
    setVideo("isVisible", !video.isVisible);
  }

  function toggleLoop() {
    setVideo("loop", !video.loop);
  }

  async function getCurrentTime(): Promise<TimePiece | undefined> {
    const currTime = await player()?.getCurrentTime();
    if (currTime) {
      const minute = Math.floor(currTime / 60);
      const second = Math.floor(currTime - minute * 60);

      return { minute, second };
    }
    return undefined;
  }

  async function setStartToNow() {
    const currTime = await getCurrentTime();
    if (currTime) {
      setVideo("start", {
        minute: currTime.minute,
        second: currTime.second,
      });
    }
  }

  async function setEndToNow() {
    const currTime = await getCurrentTime();
    if (currTime) {
      setVideo("end", {
        minute: currTime.minute,
        second: currTime.second,
      });
    }
  }

  function changeStart(startMinute: number, startSecond: number) {
    const startAsSeconds = startMinute * 60 + startSecond;
    player()?.seekTo(startAsSeconds, true);

    if (!video.playing) {
      player()?.pauseVideo();
    }
  }

  async function changeVideo(url: string) {
    const videoId = parseUrl(url);

    if (!videoId) {
      return;
    }

    player()?.loadVideoById(videoId, 0);
    let videoTitle = { snippet: { title: "---" } };

    try {
      const response = await fetch(`/api/videos/${videoId}/info`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      videoTitle = await response.json();

      if (!videoTitle || !videoTitle.snippet || !videoTitle.snippet.title) {
        console.warn("Invalid video info response:", videoTitle);
        videoTitle = { snippet: { title: "Unknown Title" } };
      }
    } catch (error) {
      console.error("Error fetching video info:", error);
      videoTitle = { snippet: { title: "Error Loading Title" } };
    }

    setVideo(
      produce((v) => {
        v.start = {
          second: 0,
          minute: 0,
        };
        v.end = {
          second: 0,
          minute: 0,
        };
        v.duration = 0;
        v.videoId = videoId;
        v.videoUrl = url;
        v.title = videoTitle.snippet.title;
      })
    );
  }

  function changePlaybackRate(rate: number) {
    const newRate = Math.max(0.5, Math.min(1.5, rate));
    setVideo("playbackRate", newRate);
    player()?.setPlaybackRate(newRate);
  }

  // Add tag management functions
  function addTag(tag: string) {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (!video.tags.includes(trimmedTag)) {
      setVideo("tags", (tags) => [...(tags || []), trimmedTag]);
    }
  }

  function removeTag(tag: string) {
    setVideo("tags", (tags) => (tags || []).filter(t => t !== tag));
  }

  return {
    player,
    video,
    setVideo,
    saving,
    setSaving,
    saveSuccess,
    setSaveSuccess,
    playVideo,
    pauseVideo,
    toggleVideoVisibility,
    toggleLoop,
    setStartToNow,
    setEndToNow,
    changeStart,
    changeVideo,
    changePlaybackRate,
    getCurrentTime,
    addTag,           // Add the tag functions
    removeTag
  };
}
