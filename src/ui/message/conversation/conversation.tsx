import React from "react";
import { Message } from "../message";

interface ConversationProps {
  content: string;
  character?: string;
  onClose?: () => void;
}

export const Conversation: React.FC<ConversationProps> = ({
  content,
  character = "System", // Default to "System" if no character provided
  onClose,
}) => {
  const conversationContent = (
    <div className="conversation-message">
      <div className="character-name">{character}:</div>
      <div className="message-content">{content}</div>
    </div>
  );

  return <Message content={conversationContent} onClose={onClose} />;
};

export default Conversation;
