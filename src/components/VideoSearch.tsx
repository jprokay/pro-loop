import { createSignal, Show, createEffect, onCleanup } from "solid-js";
import VideoSearchResults from "./VideoSearchResults";

type Props = {
  onSelectVideo: (videoId: string, title: string) => void;
};

export default function VideoSearch(props: Props) {
  const [query, setQuery] = createSignal("");
  const [debouncedQuery, setDebouncedQuery] = createSignal("");
  const [isSearching, setIsSearching] = createSignal(false);
  const [results, setResults] = createSignal<any[]>([]);
  const [error, setError] = createSignal<string | null>(null);

  // Debounce the query input
  createEffect(() => {
    const currentQuery = query();
    if (!currentQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(currentQuery);
    }, 200); // 500ms debounce delay

    onCleanup(() => clearTimeout(timer));
  });

  // Perform search when debounced query changes
  createEffect(() => {
    const searchQuery = debouncedQuery();
    if (!searchQuery.trim()) return;

    performSearch(searchQuery);
  });

  async function performSearch(searchQuery: string) {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search videos");
      }

      const data = await response.json();
      setResults(data.videos || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during search");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleVideoSelect(videoId: string, title: string) {
    props.onSelectVideo(videoId, title);
    setResults([]); // Clear results after selection
    setQuery(""); // Clear the search input
  }

  return (
    <div class="w-full mb-6">
      <div class="relative mb-4">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input
          type="search"
          class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search for YouTube videos..."
          value={query()}
          onInput={(e) => setQuery(e.target.value)}
        />
        {isSearching() && (
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <span class="inline-block animate-spin text-gray-500">⟳</span>
          </div>
        )}
      </div>

      <Show when={error()}>
        <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          {error()}
        </div>
      </Show>

      <Show when={results().length > 0}>
        <VideoSearchResults
          results={results()}
          onSelect={handleVideoSelect}
        />
      </Show>
    </div>
  );
}
