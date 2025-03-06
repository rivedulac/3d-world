import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CircularButton from "../circularButton";

describe("CircularButton", () => {
  const mockOnClick = jest.fn();
  const mockOnTouchStart = jest.fn();
  const mockOnTouchEnd = jest.fn();
  const mockOnMouseDown = jest.fn();
  const mockOnMouseUp = jest.fn();
  const mockOnMouseLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering
  test("renders with the provided icon", () => {
    render(<CircularButton icon="🔄" ariaLabel="Refresh" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("🔄");
    expect(button).toHaveAttribute("aria-label", "Refresh");
  });

  // ID assignment
  test("assigns the provided ID to the button", () => {
    render(<CircularButton id="test-button" icon="📋" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("id", "test-button");
  });

  // Click handling
  test("calls the onClick handler when clicked", () => {
    render(<CircularButton icon="🔄" onClick={mockOnClick} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Position classes
  test("applies the correct position class", () => {
    render(
      <CircularButton
        icon="🔄"
        position="bottom-right"
        isActive={true}
        className="custom-class"
      />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "circularButton",
      "bottom-right",
      "active",
      "custom-class"
    );
  });

  // Active state
  test("applies the active class when isActive is true", () => {
    render(<CircularButton icon="🔄" isActive={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("active");
  });

  // Custom className
  test("includes custom className when provided", () => {
    render(<CircularButton icon="🔄" className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("circularButton", "custom-class");
  });

  // Accessibility
  test("sets the aria-label attribute correctly", () => {
    render(<CircularButton icon="🔄" ariaLabel="Refresh" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Refresh");
  });

  // Combining multiple props
  test("combines all classes correctly", () => {
    render(
      <CircularButton
        icon="📱"
        position="bottom-right-secondary"
        isActive={true}
        className="test-class"
      />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "circularButton",
      "bottom-right-secondary",
      "active",
      "test-class"
    );
  });

  it("handles touch events", () => {
    render(
      <CircularButton
        icon="🔄"
        onTouchStart={mockOnTouchStart}
        onTouchEnd={mockOnTouchEnd}
      />
    );
    const button = screen.getByRole("button");

    fireEvent.touchStart(button);
    expect(mockOnTouchStart).toHaveBeenCalledTimes(1);

    fireEvent.touchEnd(button);
    expect(mockOnTouchEnd).toHaveBeenCalledTimes(1);
  });

  it("handles mouse events", () => {
    render(
      <CircularButton
        icon="🔄"
        onMouseDown={mockOnMouseDown}
        onMouseUp={mockOnMouseUp}
        onMouseLeave={mockOnMouseLeave}
      />
    );
    const button = screen.getByRole("button");

    fireEvent.mouseDown(button);
    expect(mockOnMouseDown).toHaveBeenCalledTimes(1);

    fireEvent.mouseUp(button);
    expect(mockOnMouseUp).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(button);
    expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("logs creation message with ID", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<CircularButton icon="🔄" id="test-button" />);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Circular button created: test-button"
    );
    consoleSpy.mockRestore();
  });

  it("logs creation message without ID", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<CircularButton icon="🔄" />);
    expect(consoleSpy).toHaveBeenCalledWith("Circular button created: ");
    consoleSpy.mockRestore();
  });
});
