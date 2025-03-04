import React, { useState } from "react";
import CircularButton from "./circularButton";

/**
 * Button component that toggles the keyboard visibility
 */
interface KeyboardButtonProps {
  onToggle?: (visible: boolean) => void;
}

const KeyboardButton: React.FC<KeyboardButtonProps> = ({ onToggle }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    if (onToggle) {
      onToggle(newVisibility);
    }
  };

  return (
    <CircularButton
      id="keyboard-btn"
      icon="⌨️"
      onClick={handleClick}
      position="bottom-right"
      ariaLabel="Toggle Keyboard"
    />
  );
};

export default KeyboardButton;
