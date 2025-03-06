import React, { useState } from "react";
import { Character } from "../../entities/character";
import CircularButton from "../buttons/circularButton";
import KeyboardButton from "../buttons/keyboardButton";
import "./VirtualKeyboard.css";

interface VirtualKeyboardProps {
  character: Character | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  character,
}) => {
  const [isVisible, setIsVisible] = useState(
    () => "ontouchstart" in window || navigator.maxTouchPoints > 0
  );

  const handlePress = (keyCode: string) => {
    if (!character) return;

    const keyDownEvent = new KeyboardEvent("keydown", {
      code: keyCode,
      bubbles: true,
    });

    document.dispatchEvent(keyDownEvent);
  };

  const handleRelease = (keyCode: string) => {
    if (!character) return;

    const keyUpEvent = new KeyboardEvent("keyup", {
      code: keyCode,
      bubbles: true,
    });

    document.dispatchEvent(keyUpEvent);
  };

  return (
    <div>
      <KeyboardButton onClick={() => setIsVisible(!isVisible)} />
      {isVisible && (
        <div className="virtual-keyboard">
          <div className="move-container">
            <div className="label">Move</div>
            <div className="move-button-group">
              <CircularButton
                icon="W"
                onTouchStart={() => handlePress("KeyW")}
                onTouchEnd={() => handleRelease("KeyW")}
                onMouseDown={() => handlePress("KeyW")}
                onMouseUp={() => handleRelease("KeyW")}
                onMouseLeave={() => handleRelease("KeyW")}
                className="vk-forward"
              />
              <CircularButton
                icon="S"
                onTouchStart={() => handlePress("KeyS")}
                onTouchEnd={() => handleRelease("KeyS")}
                onMouseDown={() => handlePress("KeyS")}
                onMouseUp={() => handleRelease("KeyS")}
                onMouseLeave={() => handleRelease("KeyS")}
                className="vk-backward"
              />
            </div>
          </div>

          <div className="rotate-container">
            <div className="label">Rotate</div>
            <div className="pitch-button-group">
              <CircularButton
                icon="▲"
                onTouchStart={() => handlePress("ArrowUp")}
                onTouchEnd={() => handleRelease("ArrowUp")}
                onMouseDown={() => handlePress("ArrowUp")}
                onMouseUp={() => handleRelease("ArrowUp")}
                onMouseLeave={() => handleRelease("ArrowUp")}
                className="vk-pitchUp"
              />
              <CircularButton
                icon="▼"
                onTouchStart={() => handlePress("ArrowDown")}
                onTouchEnd={() => handleRelease("ArrowDown")}
                onMouseDown={() => handlePress("ArrowDown")}
                onMouseUp={() => handleRelease("ArrowDown")}
                onMouseLeave={() => handleRelease("ArrowDown")}
                className="vk-pitchDown"
              />
            </div>
            <div className="yaw-button-group">
              <CircularButton
                icon="◀"
                onTouchStart={() => handlePress("ArrowLeft")}
                onTouchEnd={() => handleRelease("ArrowLeft")}
                onMouseDown={() => handlePress("ArrowLeft")}
                onMouseUp={() => handleRelease("ArrowLeft")}
                onMouseLeave={() => handleRelease("ArrowLeft")}
                className="vk-yawLeft"
              />
              <CircularButton
                icon="▶"
                onTouchStart={() => handlePress("ArrowRight")}
                onTouchEnd={() => handleRelease("ArrowRight")}
                onMouseDown={() => handlePress("ArrowRight")}
                onMouseUp={() => handleRelease("ArrowRight")}
                onMouseLeave={() => handleRelease("ArrowRight")}
                className="vk-yawRight"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
