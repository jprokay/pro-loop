import { Component, createSignal, onCleanup, onMount } from "solid-js";

const CassetteTapeLoader: Component = () => {
  const [progress, setProgress] = createSignal(0);
  let interval: NodeJS.Timeout;

  onMount(() => {
    interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="flex flex-col items-center justify-center w-full h-full">
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        xmlns="http://www.w3.org/2000/svg"
        class="text-primary"
      >
        {/* Cassette outline */}
        <rect x="10" y="10" width="180" height="100" rx="5" fill="none" stroke="currentColor" stroke-width="3" />

        {/* Label area */}
        <rect x="30" y="20" width="140" height="40" fill="none" stroke="currentColor" stroke-width="2" />

        {/* Tape reels */}
        <circle cx="60" cy="75" r="20" fill="none" stroke="currentColor" stroke-width="2" />
        <circle cx="140" cy="75" r="20" fill="none" stroke="currentColor" stroke-width="2" />

        {/* Reel details */}
        <circle cx="60" cy="75" r="5" fill="currentColor" />
        <circle cx="140" cy="75" r="5" fill="currentColor" />

        {/* Tape windows */}
        <rect x="45" y="70" width="30" height="5" fill="currentColor" />
        <rect x="125" y="70" width="30" height="5" fill="currentColor" />

        {/* Text */}
        <text x="100" y="45" text-anchor="middle" fill="currentColor" font-family="monospace" font-size="12">LOADING...</text>

        {/* Progress bar */}
        <rect
          x="30"
          y="55"
          width="140"
          height="5"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        />
        <rect
          x="30"
          y="55"
          width={140 * progress() / 100}
          height="5"
          fill="currentColor"
        />

      </svg>
      <p class="mt-4 text-primary font-mono">{Math.round(progress())}%</p>
    </div>
  );
};

export default CassetteTapeLoader;
