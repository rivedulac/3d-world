import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VirtualKeyboard } from "../virtualKeyboard";

// Mock console.log to verify it's called
const consoleSpy = jest.spyOn(console, "log");

// Mock CircularButton and KeyboardButton
jest.mock("../../buttons/circularButton", () => ({
  __esModule: true,
  default: ({
    onClick,
    icon,
    className,
  }: {
    onClick: () => void;
    icon: string;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
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
  beforeEach(() => {
    consoleSpy.mockClear();
    // Mock touch detection
    Object.defineProperty(window, "ontouchstart", { value: true });
    Object.defineProperty(navigator, "maxTouchPoints", { value: 1 });
  });

  it("handles forward button click", async () => {
    render(<VirtualKeyboard />);
    const forwardButton = screen.getByText("W");
    await userEvent.click(forwardButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: forward");
  });

  it("handles backward button click", async () => {
    render(<VirtualKeyboard />);
    const backwardButton = screen.getByText("S");
    await userEvent.click(backwardButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: backward");
  });

  it("handles pitch up button click", async () => {
    render(<VirtualKeyboard />);
    const pitchUpButton = screen.getByText("▲");
    await userEvent.click(pitchUpButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: pitchUp");
  });

  it("handles pitch down button click", async () => {
    render(<VirtualKeyboard />);
    const pitchDownButton = screen.getByText("▼");
    await userEvent.click(pitchDownButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: pitchDown");
  });

  it("handles yaw left button click", async () => {
    render(<VirtualKeyboard />);
    const yawLeftButton = screen.getByText("◀");
    await userEvent.click(yawLeftButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: yawLeft");
  });

  it("handles yaw right button click", async () => {
    render(<VirtualKeyboard />);
    const yawRightButton = screen.getByText("▶");
    await userEvent.click(yawRightButton);
    expect(consoleSpy).toHaveBeenCalledWith("Button clicked: yawRight");
  });
});
