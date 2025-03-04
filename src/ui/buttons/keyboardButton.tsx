import React from "react";
import CircularButton from "./circularButton";

/**
 * Button component that toggles the keyboard visibility
 */
interface KeyboardButtonProps {
  onClick: () => void;
}

const KeyboardButton: React.FC<KeyboardButtonProps> = ({ onClick }) => {
  return (
    <CircularButton
      id="keyboard-btn"
      icon="⌨️"
      onClick={onClick}
      position="bottom-right"
      ariaLabel="Toggle Keyboard"
    />
  );
};

export default KeyboardButton;
