import { Component } from "solid-js"

type TagProps = {
  name: string
  onRemoveTag?: (tagName: string) => void
}
const Tag: Component<TagProps> = (props) => {
  return (
    <div class="badge badge-soft badge-primary gap-1">
      {props.name}
      {props.onRemoveTag &&
        <button
          type="button"
          onClick={() => props.onRemoveTag!(props.name)}
          class="ml-1"
          aria-label={`Remove tag ${props.name}`}
          data-testid={`remove-tag-${props.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      }
    </div>
  )

}

export default Tag
