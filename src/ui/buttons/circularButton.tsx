import React, { useEffect } from "react";
import "./circularButton.css";

export type CircularButtonPosition =
  | "bottom-right"
  | "bottom-right-secondary"
  | undefined;

export interface CircularButtonProps {
  // The icon or text content to display inside the button
  icon: React.ReactNode;

  // Unique ID for the button
  id?: string;

  // Function to call when the button is clicked
  onClick: () => void;

  // CSS class to add to the button
  className?: string;

  // Predefined position for the button
  position?: CircularButtonPosition;

  // Whether the button is in an active/selected state
  isActive?: boolean;

  // ARIA label for accessibility
  ariaLabel?: string;
}

// A reusable circular button component for UI controls
const CircularButton: React.FC<CircularButtonProps> = ({
  icon,
  id,
  onClick,
  className = "",
  position,
  isActive = false,
  ariaLabel,
}) => {
  useEffect(() => {
    console.log(`Circular button created: ${id || ""}`);
    return () => {
      // Cleanup logic if needed
    };
  }, [id]);

  const buttonClassNames = [
    "circularButton",
    position ? position : "",
    isActive ? "active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      id={id}
      className={buttonClassNames}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      {icon}
    </button>
  );
};

export default CircularButton;
