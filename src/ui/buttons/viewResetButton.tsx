import React from "react";
import { gameInstance } from "../../core/gameInstance";
import CircularButton from "./circularButton";

/**
 * Button component that resets the camera view to its default orientation
 */
const ViewResetButton: React.FC = () => {
  const handleClick = () => {
    // Check if character exists in the game instance
    if (gameInstance.character) {
      // Reset the camera view to its default orientation
      gameInstance.character.resetCameraView();
    }
  };

  return (
    <CircularButton
      id="view-reset-btn"
      icon="👁️"
      onClick={handleClick}
      position="bottom-right-secondary"
      ariaLabel="Reset camera view"
    />
  );
};

/**
 * Singleton pattern implementation
 */
let instance: React.ReactElement | null = null;

export const getInstance = (): React.ReactElement => {
  if (!instance) {
    instance = <ViewResetButton />;
  }
  return instance;
};

export default ViewResetButton;
