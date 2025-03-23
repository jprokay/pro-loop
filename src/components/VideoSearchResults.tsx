import { For } from "solid-js";

type VideoResult = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
};

type Props = {
  results: VideoResult[];
  onSelect: (videoId: string, title: string) => void;
};

export default function VideoSearchResults(props: Props) {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <ul class="divide-y divide-gray-200">
        <For each={props.results}>
          {(video) => (
            <li class="hover:bg-gray-50 cursor-pointer">
              <button
                class="w-full text-left p-3 flex items-center gap-3"
                onClick={() => props.onSelect(video.id, video.title)}
              >
                <div class="flex-shrink-0">
                  <img
                    src={video.thumbnails.default.url}
                    alt={video.title}
                    class="w-10 h-10 object-cover rounded"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {video.title}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {video.channelTitle}
                  </p>
                </div>
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
