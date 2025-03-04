import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Instruction } from "../instruction";

// Add this mock before other mocks
jest.mock("../../../../../package.json", () => ({
  version: "1.0.0",
}));

// Mock dependencies
jest.mock("../../message", () => ({
  Message: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="mock-message">{content}</div>
  ),
}));

jest.mock("../../../buttons/circularButton", () => ({
  __esModule: true,
  default: ({
    onClick,
    icon,
    ariaLabel,
  }: {
    onClick: () => void;
    icon: string;
    ariaLabel: string;
  }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {icon}
    </button>
  ),
}));

jest.mock("../gameControls", () => ({
  GameControls: ({ version }: { version: string }) => (
    <div data-testid="mock-game-controls">Game Controls v{version}</div>
  ),
}));

describe("Instruction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders circular button with correct props", () => {
    render(<Instruction />);
    const button = screen.getByRole("button", { name: "Toggle instructions" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("📢");
  });

  it("shows instruction list when button is clicked", async () => {
    render(<Instruction />);
    const button = screen.getByRole("button");

    await userEvent.click(button);

    expect(screen.getByText("Available Instructions")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Game Controls");
  });

  it("stores game controls instruction on mount", () => {
    render(<Instruction />);
    expect(screen.getByTestId("mock-message")).toBeInTheDocument();
    expect(screen.getByTestId("mock-game-controls")).toBeInTheDocument();
  });

  it("hides instruction list by default", () => {
    render(<Instruction />);
    expect(
      screen.queryByText("Available Instructions")
    ).not.toBeInTheDocument();
  });

  it("toggles instruction list visibility", async () => {
    render(<Instruction />);
    const button = screen.getByRole("button");

    // Show list
    await userEvent.click(button);
    expect(screen.getByText("Available Instructions")).toBeInTheDocument();

    // Hide list
    await userEvent.click(button);
    expect(
      screen.queryByText("Available Instructions")
    ).not.toBeInTheDocument();
  });
});
