import React, { useState, useEffect } from "react";
import { Message } from "../message";
import CircularButton from "../../buttons/circularButton";
import { GameControls } from "./gameControls";
import pkg from "../../../../package.json";

interface StoredInstruction {
  title: string;
  content: React.ReactNode;
  timestamp: Date;
}

export const Instruction: React.FC = () => {
  const [storedInstructions, setStoredInstructions] = useState<
    StoredInstruction[]
  >([]);
  const [showList, setShowList] = useState(false);

  const storeInstruction = (title: string, content: React.ReactNode) => {
    setStoredInstructions((prev) => {
      const existingIndex = prev.findIndex((instr) => instr.title === title);
      if (existingIndex < 0) {
        return [...prev, { title, content, timestamp: new Date() }];
      }
      return prev;
    });
  };

  useEffect(() => {
    const gameControls = <GameControls version={pkg.version} />;
    storeInstruction("Game Controls", gameControls);
  }, []);

  return (
    <div>
      <CircularButton
        onClick={() => setShowList(!showList)}
        icon="📢"
        ariaLabel="Toggle instructions"
      />

      {showList && (
        <div className="instructions-list">
          <h3>Available Instructions</h3>
          <ul>
            {storedInstructions.map((instruction, index) => (
              <li
                key={index}
                onClick={() =>
                  storeInstruction(instruction.title, instruction.content)
                }
              >
                {instruction.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Message content={storedInstructions[0]?.content} />
    </div>
  );
};

export default Instruction;
