import React, { useState } from "react";
// import { Character } from "../../character";
import CircularButton from "../buttons/circularButton";
import KeyboardButton from "../buttons/keyboardButton";
import "./VirtualKeyboard.css";

interface VirtualKeyboardProps {
  //   character: Character | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = (
  {
    //   character, // TODO: Use the character to handl/e the button click
  }
) => {
  const [isVisible, setIsVisible] = useState(
    () => "ontouchstart" in window || navigator.maxTouchPoints > 0
  );

  const handleClick = (direction: string) => {
    // TODO: Implement the logic to handle the button click
    console.log(`Button clicked: ${direction}`);
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
                onClick={() => handleClick("forward")}
                className="vk-forward"
              />
              <CircularButton
                icon="S"
                onClick={() => handleClick("backward")}
                className="vk-backward"
              />
            </div>
          </div>

          <div className="rotate-container">
            <div className="label">Rotate</div>
            <div className="pitch-button-group">
              <CircularButton
                icon="▲"
                onClick={() => handleClick("pitchUp")}
                className="vk-pitchUp"
              />
              <CircularButton
                icon="▼"
                onClick={() => handleClick("pitchDown")}
                className="vk-pitchDown"
              />
            </div>
            <div className="yaw-button-group">
              <CircularButton
                icon="◀"
                onClick={() => handleClick("yawLeft")}
                className="vk-yawLeft"
              />
              <CircularButton
                icon="▶"
                onClick={() => handleClick("yawRight")}
                className="vk-yawRight"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
