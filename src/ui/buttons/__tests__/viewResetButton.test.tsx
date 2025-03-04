import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ViewResetButton from "../viewResetButton";
import { gameInstance } from "../../../core/gameInstance";

// Mock the gameInstance
jest.mock("../../../core/gameInstance", () => ({
  gameInstance: {
    character: {
      resetCameraView: jest.fn(),
    },
  },
}));

describe("ViewResetButton", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly", () => {
    render(<ViewResetButton />);
    const button = screen.getByRole("button");

    // Check if the button is in the document
    expect(button).toBeInTheDocument();

    // Check if it has the eye icon
    expect(button).toHaveTextContent("👁️");

    // Check if it has the correct aria label
    expect(button).toHaveAttribute("aria-label", "Reset camera view");
  });

  test("calls resetCameraView when clicked", () => {
    render(<ViewResetButton />);
    const button = screen.getByRole("button");

    // Click the button
    fireEvent.click(button);

    // Check if resetCameraView was called
    expect(gameInstance.character?.resetCameraView).toHaveBeenCalledTimes(1);
  });

  test("uses CircularButton with correct props", () => {
    render(<ViewResetButton />);
    const button = screen.getByRole("button");

    // Check if it has the correct id
    expect(button).toHaveAttribute("id", "view-reset-btn");

    // Check if it has the correct position class
    expect(button).toHaveClass("bottom-right-secondary");
  });

  test("handles case when character is not available", () => {
    // Temporarily modify mock to simulate missing character
    const originalCharacter = gameInstance.character;
    gameInstance.character = null;

    // Render and click should not throw an error
    render(<ViewResetButton />);
    const button = screen.getByRole("button");
    expect(() => fireEvent.click(button)).not.toThrow();

    // Restore the original mock
    gameInstance.character = originalCharacter;
  });
});
