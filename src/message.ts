// Import package.json using ES modules syntax
import pkg from "../package.json";

// Define message types
export enum MessageType {
  CONVERSATION,
  INSTRUCTION,
}

// Interface for stored instructions
interface StoredInstruction {
  title: string;
  content: string;
  timestamp: Date;
}

export class MessageSystem {
  private messageElement: HTMLDivElement;
  private instructionsButton: HTMLButtonElement;
  private instructionsListElement: HTMLDivElement;
  private storedInstructions: StoredInstruction[] = [];
  private static instance: MessageSystem | null = null;
  private currentlyShowingMessage: boolean = false;

  private constructor() {
    // Create message container
    this.messageElement = document.createElement("div");
    this.messageElement.style.position = "absolute";
    this.messageElement.style.top = "20px";
    this.messageElement.style.left = "20px";
    this.messageElement.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    this.messageElement.style.color = "white";
    this.messageElement.style.padding = "20px";
    this.messageElement.style.borderRadius = "5px";
    this.messageElement.style.fontFamily = "Arial, sans-serif";
    this.messageElement.style.zIndex = "1000";
    this.messageElement.style.display = "none";
    this.messageElement.style.maxWidth = "300px";

    // Create instructions button
    this.instructionsButton = document.createElement("button");
    this.instructionsButton.innerText = "📢";
    this.instructionsButton.style.position = "absolute";
    this.instructionsButton.style.top = "20px";
    this.instructionsButton.style.left = "20px";
    this.instructionsButton.style.padding = "8px 12px";
    this.instructionsButton.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    this.instructionsButton.style.color = "white";
    this.instructionsButton.style.border = "none";
    this.instructionsButton.style.borderRadius = "4px";
    this.instructionsButton.style.cursor = "pointer";
    this.instructionsButton.style.zIndex = "999";
    this.instructionsButton.addEventListener("click", () =>
      this.showInstructionsList()
    );

    // Create instructions list container
    this.instructionsListElement = document.createElement("div");
    this.instructionsListElement.style.position = "absolute";
    this.instructionsListElement.style.top = "60px";
    this.instructionsListElement.style.left = "20px";
    this.instructionsListElement.style.backgroundColor =
      "rgba(70, 70, 70, 0.9)";
    this.instructionsListElement.style.color = "white";
    this.instructionsListElement.style.padding = "15px";
    this.instructionsListElement.style.borderRadius = "5px";
    this.instructionsListElement.style.fontFamily = "Arial, sans-serif";
    this.instructionsListElement.style.zIndex = "1000";
    this.instructionsListElement.style.display = "none";
    this.instructionsListElement.style.maxWidth = "300px";
    this.instructionsListElement.style.maxHeight = "400px";
    this.instructionsListElement.style.overflowY = "auto";

    // Add event listeners
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hide();
      }
    });

    document.body.appendChild(this.messageElement);
    document.body.appendChild(this.instructionsButton);
    document.body.appendChild(this.instructionsListElement);

    // Make sure the button is visible initially
    this.instructionsButton.style.display = "block";
  }

  public static getInstance(): MessageSystem {
    if (!MessageSystem.instance) {
      MessageSystem.instance = new MessageSystem();
    }
    return MessageSystem.instance;
  }

  public show(
    message: string,
    type: MessageType = MessageType.CONVERSATION
  ): void {
    // Create close button
    const closeButton = `
      <div class="close-button" style="
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        background-color: rgba(200, 50, 50, 0.8);
        border-radius: 50%;
        text-align: center;
        line-height: 20px;
        cursor: pointer;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">×</div>
    `;

    // Add the close button to the message
    this.messageElement.innerHTML = closeButton + message;
    this.messageElement.style.display = "block";
    this.instructionsButton.style.display = "none";
    this.instructionsListElement.style.display = "none";
    this.currentlyShowingMessage = true;

    // Add event listener to the close button
    const closeButtonElement =
      this.messageElement.querySelector(".close-button");
    if (closeButtonElement) {
      closeButtonElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling to the message element
        this.hide();
      });
    }

    // Store instruction if it's an instruction type
    if (type === MessageType.INSTRUCTION) {
      // Extract title from message (assuming it's in an h3 tag)
      const titleMatch = message.match(/<h3>(.*?)<\/h3>/);
      const title = titleMatch ? titleMatch[1] : "Untitled Instruction";

      this.storeInstruction(title, message);
    }
  }

  public hide(): void {
    this.messageElement.style.display = "none";
    this.instructionsListElement.style.display = "none";
    this.instructionsButton.style.display = "block";
    this.currentlyShowingMessage = false;
  }

  public showGameInstructions(): void {
    const version = pkg.version;
    const instructions = `
            <h3>Game Controls</h3>
            <p>Version: ${version}</p>
            <h4>Movement:</h4>
            <p>W - Move Forward</p>
            <p>A - Rotate Left</p>
            <p>S - Move Backward</p>
            <p>D - Rotate Right</p>
        `;
    this.show(instructions, MessageType.INSTRUCTION);
  }

  private storeInstruction(title: string, content: string): void {
    // Check if this instruction already exists (by title)
    const existingIndex = this.storedInstructions.findIndex(
      (instr) => instr.title === title
    );

    if (existingIndex < 0) {
      // Add new instruction
      this.storedInstructions.push({
        title,
        content,
        timestamp: new Date(),
      });
    }
  }

  private showInstructionsList(): void {
    if (this.storedInstructions.length === 0) {
      this.instructionsListElement.innerHTML =
        "<p>No instructions available.</p>";
      this.instructionsListElement.style.display = "block";
      return;
    }

    // Get instructions in chronological order (oldest first)
    // This fixes the index reversal issue
    const orderedInstructions = [...this.storedInstructions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Create the list
    let listHtml =
      "<h3>Available Instructions</h3><ul style='list-style-type: none; padding: 0;'>";

    orderedInstructions.forEach((instruction, index) => {
      listHtml += `
        <li data-index="${index}" style="padding: 8px; margin: 5px 0; background-color: rgba(100, 100, 100, 0.7); 
        border-radius: 3px; cursor: pointer; transition: background-color 0.2s;">
          ${instruction.title}
        </li>
      `;
    });

    listHtml += "</ul><p><small>Click an instruction to view</small></p>";

    this.instructionsListElement.innerHTML = listHtml;
    this.instructionsListElement.style.display = "block";

    // Add click event listeners to list items
    const listItems = this.instructionsListElement.querySelectorAll("li");
    listItems.forEach((item) => {
      item.addEventListener("mouseover", () => {
        (item as HTMLElement).style.backgroundColor =
          "rgba(120, 120, 120, 0.9)";
      });

      item.addEventListener("mouseout", () => {
        (item as HTMLElement).style.backgroundColor =
          "rgba(100, 100, 100, 0.7)";
      });

      item.addEventListener("click", (e) => {
        const index = parseInt(
          (e.currentTarget as HTMLElement).getAttribute("data-index") || "0"
        );
        this.showStoredInstruction(index);
      });
    });
  }

  private showStoredInstruction(index: number): void {
    if (index >= 0 && index < this.storedInstructions.length) {
      // Sort instructions to match the display order (oldest first)
      const orderedInstructions = [...this.storedInstructions].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const instruction = orderedInstructions[index];

      this.show(instruction.content, MessageType.INSTRUCTION);
    }
  }

  // Add a new instruction
  public addInstruction(title: string, content: string): void {
    const formattedContent = `<h3>${title}</h3>${content}`;
    this.show(formattedContent, MessageType.INSTRUCTION);
  }

  // Check if currently showing a message
  public isShowingMessage(): boolean {
    return this.currentlyShowingMessage;
  }
}
