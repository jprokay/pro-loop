import { Component, Show } from "solid-js";

type SaveControlsProps = {
  enableSave: boolean;
  loopId?: number;
  saving: boolean;
  saveSuccess: boolean;
  fallback: any;
};

const SaveControls: Component<SaveControlsProps> = (props) => {
  if (!props.enableSave) {
    return props.fallback;
  }

  return (
    <div class="flex justify-center gap-4 mt-6">
      <Show when={props.loopId}>
        <button
          class="btn btn-outline py-4 px-8 text-lg"
          type="submit"
          disabled={props.saving}
        >
          <Show when={props.saving} fallback="Update">
            <span class="loading loading-spinner loading-sm mr-2"></span>
            Updating...
          </Show>
        </button>
      </Show>
      <button
        class={`btn py-4 px-8 text-lg ${props.saveSuccess ? 'btn-success' : 'btn-primary'}`}
        type="submit"
        disabled={props.saving}
      >
        <Show
          when={props.saving}
          fallback={
            <Show when={props.saveSuccess} fallback="Save">
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
  );
};

export default SaveControls;
