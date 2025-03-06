import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VirtualKeyboard } from "../virtualKeyboard";
import { Character } from "../../../entities/character";

// Mock Character
jest.mock("../../../entities/character");

// Mock CircularButton and KeyboardButton
jest.mock("../../buttons/circularButton", () => ({
  __esModule: true,
  default: ({
    icon,
    onMouseDown,
    onMouseUp,
    className,
  }: {
    icon: string;
    onMouseDown: () => void;
    onMouseUp: () => void;
    className?: string;
  }) => (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className={className}
    >
      {icon}
    </button>
  ),
}));

jest.mock("../../buttons/keyboardButton", () => ({
  __esModule: true,
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>⌨️</button>
  ),
}));

describe("VirtualKeyboard", () => {
  const mockCharacter = new Character({ scene: {} as THREE.Scene });
  const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

  beforeEach(() => {
    dispatchEventSpy.mockClear();
    // Mock touch detection
    Object.defineProperty(window, "ontouchstart", { value: true });
    Object.defineProperty(navigator, "maxTouchPoints", { value: 1 });
  });

  it("dispatches keyboard events for forward movement", async () => {
    render(<VirtualKeyboard character={mockCharacter} />);
    const forwardButton = screen.getByText("W");

    // Create the events with the required properties
    const keyDownEvent = new KeyboardEvent("keydown", {
      code: "KeyW",
      bubbles: true,
    });
    const keyUpEvent = new KeyboardEvent("keyup", {
      code: "KeyW",
      bubbles: true,
    });

    // Use these events instead of userEvent.pointer
    await userEvent.pointer({ target: forwardButton, keys: "[MouseLeft>]" });
    document.dispatchEvent(keyDownEvent);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "keydown",
        code: "KeyW",
      })
    );

    await userEvent.pointer({ target: forwardButton, keys: "[/MouseLeft]" });
    document.dispatchEvent(keyUpEvent);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "keyup",
        code: "KeyW",
      })
    );
  });

  it("does not dispatch events when character is null", async () => {
    render(<VirtualKeyboard character={null} />);
    const forwardButton = screen.getByText("W");

    await userEvent.pointer({ target: forwardButton, keys: "[MouseLeft>]" });
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it("toggles keyboard visibility", async () => {
    render(<VirtualKeyboard character={mockCharacter} />);
    const toggleButton = screen.getByText("⌨️");

    expect(screen.getByText("Move")).toBeInTheDocument();
    await userEvent.click(toggleButton);
    expect(screen.queryByText("Move")).not.toBeInTheDocument();
  });
});
