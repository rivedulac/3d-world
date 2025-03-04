import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Conversation } from "../conversation";

// Mock the Message component since we're only testing Conversation's logic
jest.mock("../../message", () => ({
  Message: ({
    content,
    onClose,
  }: {
    content: React.ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="mock-message" onClick={onClose}>
      {content}
    </div>
  ),
}));

describe("Conversation", () => {
  const mockContent = "Hello, this is a test message";
  const mockCharacter = "TestChar";
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default character name when no character provided", () => {
    render(<Conversation content={mockContent} />);

    expect(screen.getByText("System:")).toBeInTheDocument();
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });

  it("renders with provided character name", () => {
    render(<Conversation content={mockContent} character={mockCharacter} />);

    expect(screen.getByText(`${mockCharacter}:`)).toBeInTheDocument();
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });

  it("calls onClose when message is closed", async () => {
    render(
      <Conversation
        content={mockContent}
        character={mockCharacter}
        onClose={mockOnClose}
      />
    );

    const message = screen.getByTestId("mock-message");
    await userEvent.click(message);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders with correct structure and classes", () => {
    render(<Conversation content={mockContent} character={mockCharacter} />);

    const conversationMessage = screen.getByText(mockContent).parentElement;
    expect(conversationMessage).toHaveClass("conversation-message");

    const characterName = screen.getByText(`${mockCharacter}:`);
    expect(characterName).toHaveClass("character-name");

    const messageContent = screen.getByText(mockContent);
    expect(messageContent).toHaveClass("message-content");
  });
});
