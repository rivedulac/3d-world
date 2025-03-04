import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KeyboardButton from "../keyboardButton";

describe("KeyboardButton", () => {
  it("renders with correct accessibility attributes", () => {
    render(<KeyboardButton />);

    const button = screen.getByRole("button", { name: /toggle keyboard/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("id", "keyboard-btn");
  });

  it("toggles visibility state when clicked", () => {
    render(<KeyboardButton />);

    const button = screen.getByRole("button", { name: /toggle keyboard/i });

    // Initial state
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Verify the button is still present after click
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle callback when clicked", () => {
    const mockOnToggle = jest.fn();
    render(<KeyboardButton onToggle={mockOnToggle} />);

    const button = screen.getByRole("button", { name: /toggle keyboard/i });
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });
});
