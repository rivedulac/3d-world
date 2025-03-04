import React from "react";
import { render, screen } from "@testing-library/react";
import { Loading } from "../loading";

// Mock the Message component
jest.mock("../../message", () => ({
  Message: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="mock-message">{content}</div>
  ),
}));

describe("Loading", () => {
  it("renders loading content with spinner", () => {
    render(<Loading />);

    // Check for loading text
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Initializing game...")).toBeInTheDocument();

    // Check for spinner
    const spinner = screen
      .getByTestId("mock-message")
      .querySelector(".loading-spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<Loading />);

    // Check for loading-content class
    const contentDiv = screen
      .getByTestId("mock-message")
      .querySelector(".loading-content");
    expect(contentDiv).toBeInTheDocument();

    // Check for loading-spinner class
    const spinner = screen
      .getByTestId("mock-message")
      .querySelector(".loading-spinner");
    expect(spinner).toBeInTheDocument();
  });
});
