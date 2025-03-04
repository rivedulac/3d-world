import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CircularButton from "../circularButton";

describe("CircularButton", () => {
  // Basic rendering
  test("renders with the provided icon", () => {
    const handleClick = jest.fn();
    render(<CircularButton icon="🔍" onClick={handleClick} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🔍");
  });

  // ID assignment
  test("assigns the provided ID to the button", () => {
    const handleClick = jest.fn();
    render(<CircularButton id="test-button" icon="📋" onClick={handleClick} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("id", "test-button");
  });

  // Click handling
  test("calls the onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<CircularButton icon="📢" onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Position classes
  test("applies the correct position class", () => {
    const handleClick = jest.fn();
    render(
      <CircularButton icon="⚙️" onClick={handleClick} position="bottom-right" />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bottom-right");
  });

  // Active state
  test("applies the active class when isActive is true", () => {
    const handleClick = jest.fn();
    render(<CircularButton icon="🔔" onClick={handleClick} isActive={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("active");
  });

  // Custom className
  test("includes custom className when provided", () => {
    const handleClick = jest.fn();
    render(
      <CircularButton
        icon="💬"
        onClick={handleClick}
        className="custom-class"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
    // Should also have the base class
    expect(button).toHaveClass("circularButton");
  });

  // Accessibility
  test("sets the aria-label attribute correctly", () => {
    const handleClick = jest.fn();
    render(
      <CircularButton
        icon="🔍"
        onClick={handleClick}
        ariaLabel="Search button"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Search button");
  });

  // Combining multiple props
  test("combines all classes correctly", () => {
    const handleClick = jest.fn();
    render(
      <CircularButton
        icon="📱"
        onClick={handleClick}
        className="test-class"
        position="bottom-right-secondary"
        isActive={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("circularButton");
    expect(button).toHaveClass("bottom-right-secondary");
    expect(button).toHaveClass("active");
    expect(button).toHaveClass("test-class");
  });
});
