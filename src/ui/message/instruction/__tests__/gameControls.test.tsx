import React from "react";
import { render, screen } from "@testing-library/react";
import { GameControls } from "../gameControls";

describe("GameControls", () => {
  const mockVersion = "1.0.0";

  it("renders with the provided version", () => {
    render(<GameControls version={mockVersion} />);
    expect(screen.getByText(`Version: ${mockVersion}`)).toBeInTheDocument();
  });

  it("renders all control sections and instructions", () => {
    render(<GameControls version={mockVersion} />);

    // Header
    expect(screen.getByText("🎮 Game Controls 🎮")).toBeInTheDocument();

    // Movement section
    expect(screen.getByText("Movement:")).toBeInTheDocument();
    expect(screen.getByText("🇼 Move Forward")).toBeInTheDocument();
    expect(screen.getByText("🇸 Move Backward")).toBeInTheDocument();

    // Rotation section
    expect(screen.getByText("Rotation:")).toBeInTheDocument();
    expect(screen.getByText("◀️ ▶️ Turn Left/Right")).toBeInTheDocument();
    expect(screen.getByText("🔼 🔽 Look Up/Down")).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<GameControls version={mockVersion} />);

    expect(screen.getByText("🎮 Game Controls 🎮").closest("div")).toHaveClass(
      "game-controls"
    );
    expect(screen.getByText("Movement:").closest("div")).toHaveClass(
      "controls-section"
    );
    expect(screen.getByText("Rotation:").closest("div")).toHaveClass(
      "controls-section"
    );
  });
});
