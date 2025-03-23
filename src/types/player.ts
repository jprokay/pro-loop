import { JSX } from "solid-js";

export type PlayerProps = {
  enableSave: boolean;
  fallback: JSX.Element;
  videoUrl: string;
  startMinute: number;
  startSecond: number;
  endMinute: number;
  endSecond: number;
  loopId?: number;
  loopName?: string;
  userId?: string;
  videoName?: string;
};

export type VideoState = {
  start: {
    minute: number;
    second: number;
  };
  end: {
    minute: number;
    second: number;
  };
  videoId: string;
  videoUrl: string;
  loop: boolean;
  playing: boolean;
  playbackRate: number;
  duration: number;
  name?: string;
  title?: string;
  isVisible: boolean;
};

export type TimePiece = {
  minute: number;
  second: number;
};
