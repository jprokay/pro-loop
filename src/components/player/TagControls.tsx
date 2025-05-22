import { Component, createSignal, For } from "solid-js";

type TagControlsProps = {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

const TagControls: Component<TagControlsProps> = (props) => {
  const [newTag, setNewTag] = createSignal("");

  const handleAddTag = () => {
    const tag = newTag().trim();
    if (tag && !props.tags.includes(tag)) {
      props.onAddTag(tag);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && newTag().trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Tags</legend>
      <div class="flex flex-wrap gap-2 mb-2">
        <For each={props.tags}>
          {(tag) => (
            <div class="badge badge-primary gap-1">
              {tag}
              <button 
                type="button" 
                onClick={() => props.onRemoveTag(tag)}
                class="ml-1"
                aria-label={`Remove tag ${tag}`}
                data-testid={`remove-tag-${tag}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </For>
      </div>
      
      <div class="join w-full flex flex-wrap md:flex-nowrap">
        <input
          type="text"
          class="input join-item w-full md:w-4/5"
          placeholder="Add a tag (press Enter)"
          value={newTag()}
          onInput={(e) => setNewTag(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          aria-label="New tag input"
          data-testid="tag-input"
        />
        <button 
          type="button"
          class="btn btn-accent join-item w-full md:w-1/5 py-3 text-base"
          onClick={handleAddTag}
          aria-label="Add tag"
          data-testid="add-tag-button"
        >
          Add Tag
        </button>
      </div>
    </fieldset>
  );
};

export default TagControls;
