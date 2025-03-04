import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualKeyboard } from "../virtualKeyboard";

// Mock touch detection
Object.defineProperty(window, "ontouchstart", {
  configurable: true,
  value: {},
});

Object.defineProperty(navigator, "maxTouchPoints", {
  configurable: true,
  value: 1,
});

describe("VirtualKeyboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders keyboard button", () => {
    render(<VirtualKeyboard />);
    expect(screen.getByText("⌨️")).toBeInTheDocument();
  });

  it("toggles keyboard visibility when button is clicked", () => {
    render(<VirtualKeyboard />);

    // Initially visible on touch device
    expect(screen.getByText("Move")).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByText("⌨️"));
    expect(screen.queryByText("Move")).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(screen.getByText("⌨️"));
    expect(screen.getByText("Move")).toBeInTheDocument();
  });

  it("renders all control buttons when visible", () => {
    render(<VirtualKeyboard />);

    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("▲")).toBeInTheDocument();
    expect(screen.getByText("▼")).toBeInTheDocument();
    expect(screen.getByText("◀")).toBeInTheDocument();
    expect(screen.getByText("▶")).toBeInTheDocument();
  });
});
