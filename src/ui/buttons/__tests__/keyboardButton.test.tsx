import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KeyboardButton from "../keyboardButton";

describe("KeyboardButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with keyboard emoji icon", () => {
    render(<KeyboardButton onClick={() => {}} />);
    expect(screen.getByText("⌨️")).toBeInTheDocument();
  });

  it("renders with correct accessibility attributes", () => {
    render(<KeyboardButton onClick={() => {}} />);
    const button = screen.getByRole("button", { name: /toggle keyboard/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("id", "keyboard-btn");
  });

  it("calls onClick when clicked", () => {
    const onClickMock = jest.fn();
    render(<KeyboardButton onClick={onClickMock} />);

    fireEvent.click(screen.getByText("⌨️"));
    expect(onClickMock).toHaveBeenCalled();
  });
});
