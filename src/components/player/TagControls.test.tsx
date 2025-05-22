import { render, fireEvent } from "@solidjs/testing-library";
import TagControls from "./TagControls";
import { describe, expect, it, vi } from "vitest";

describe("TagControls", () => {
  it("renders existing tags", () => {
    const { getByText } = render(() => (
      <TagControls
        tags={["rock", "chorus", "practice"]}
        onAddTag={() => { }}
        onRemoveTag={() => { }}
      />
    ));

    expect(getByText("rock")).toBeInTheDocument();
    expect(getByText("chorus")).toBeInTheDocument();
    expect(getByText("practice")).toBeInTheDocument();
  });

  it("calls onAddTag when adding a new tag", async () => {
    const addTagMock = vi.fn();
    const { getByTestId } = render(() => (
      <TagControls
        tags={[]}
        onAddTag={addTagMock}
        onRemoveTag={() => { }}
      />
    ));

    const input = getByTestId("tag-input");
    const addButton = getByTestId("add-tag-button");

    // Type a new tag
    fireEvent.input(input, { target: { value: "newTag" } });

    // Click the add button
    fireEvent.click(addButton);

    expect(addTagMock).toHaveBeenCalledWith("newTag");
  });

  it("calls onRemoveTag when removing a tag", async () => {
    const removeTagMock = vi.fn();
    const { getByTestId } = render(() => (
      <TagControls
        tags={["testTag"]}
        onAddTag={() => { }}
        onRemoveTag={removeTagMock}
      />
    ));

    const removeButton = getByTestId("remove-tag-testTag");

    // Click the remove button
    fireEvent.click(removeButton);

    expect(removeTagMock).toHaveBeenCalledWith("testTag");
  });

  it("doesn't add empty tags", async () => {
    const addTagMock = vi.fn();
    const { getByTestId } = render(() => (
      <TagControls
        tags={[]}
        onAddTag={addTagMock}
        onRemoveTag={() => { }}
      />
    ));

    const input = getByTestId("tag-input");
    const addButton = getByTestId("add-tag-button");

    // Type a space (empty tag)
    fireEvent.input(input, { target: { value: "  " } });

    // Click the add button
    fireEvent.click(addButton);

    expect(addTagMock).not.toHaveBeenCalled();
  });
});
