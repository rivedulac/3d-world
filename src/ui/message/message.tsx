import React, { useEffect } from "react";

interface MessageProps {
  onClose?: () => void; // Optional callback function when message is closed
  content: any; // Content to be displayed in the message
}

/**
 * Message component that displays content in a modal-like container
 * with close functionality via button, escape key, or touch outside
 */
export const Message: React.FC<MessageProps> = ({ onClose, content }) => {
  useEffect(() => {
    // Handler for closing message when Escape key is pressed
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    // Handler for closing message when touching outside the message container
    const handleTouchOutside = (e: TouchEvent) => {
      const target = e.target as Node;
      const messageElement = document.querySelector(".message-container");
      if (messageElement && !messageElement.contains(target)) {
        onClose?.();
      }
    };

    // Add event listeners for escape key and touch events
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("touchstart", handleTouchOutside, {
      passive: true, // Improves scrolling performance on touch devices
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [onClose]);

  return (
    <div className="message-container">
      {/* Close button in the top-right corner */}
      <div className="close-button" onClick={onClose}>
        ×
      </div>
      {/* Content container with HTML support */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Message;
