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
  private instructionElement: HTMLDivElement;
  private conversationElement: HTMLDivElement;
  private instructionsButton: HTMLButtonElement;
  private instructionsListElement: HTMLDivElement;
  private storedInstructions: StoredInstruction[] = [];
  private static instance: MessageSystem | null = null;
  private currentlyShowingInstruction: boolean = false;
  private currentlyShowingConversation: boolean = false;

  private constructor() {
    // Create instruction container (top left)
    this.instructionElement = document.createElement("div");
    this.instructionElement.style.position = "absolute";
    this.instructionElement.style.top = "20px";
    this.instructionElement.style.left = "20px";
    this.instructionElement.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    this.instructionElement.style.color = "white";
    this.instructionElement.style.padding = "20px";
    this.instructionElement.style.borderRadius = "5px";
    this.instructionElement.style.fontFamily = "Arial, sans-serif";
    this.instructionElement.style.zIndex = "1000";
    this.instructionElement.style.display = "none";
    this.instructionElement.style.maxWidth = "300px";

    // Create conversation container (top right)
    this.conversationElement = document.createElement("div");
    this.conversationElement.style.position = "absolute";
    this.conversationElement.style.top = "20px";
    this.conversationElement.style.right = "20px"; // Right side positioning
    this.conversationElement.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // White background
    this.conversationElement.style.color = "black"; // Black text
    this.conversationElement.style.padding = "20px";
    this.conversationElement.style.borderRadius = "5px";
    this.conversationElement.style.fontFamily = "Arial, sans-serif";
    this.conversationElement.style.zIndex = "1000";
    this.conversationElement.style.display = "none";
    this.conversationElement.style.maxWidth = "300px";

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

    // Add event listeners for Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideAll();
      }
    });

    document.body.appendChild(this.instructionElement);
    document.body.appendChild(this.conversationElement);
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

    if (type === MessageType.INSTRUCTION) {
      // Add the close button to the instruction message
      this.instructionElement.innerHTML = closeButton + message;
      this.instructionElement.style.display = "block";
      this.instructionsButton.style.display = "none";
      this.instructionsListElement.style.display = "none";
      this.currentlyShowingInstruction = true;

      // Store instruction
      const titleMatch = message.match(/<h3>(.*?)<\/h3>/);
      const title = titleMatch ? titleMatch[1] : "Untitled Instruction";
      this.storeInstruction(title, message);
    } else {
      // Add the close button to the conversation message
      this.conversationElement.innerHTML = closeButton + message;
      this.conversationElement.style.display = "block";
      this.currentlyShowingConversation = true;
    }

    // Add event listener to the close button
    const targetElement =
      type === MessageType.INSTRUCTION
        ? this.instructionElement
        : this.conversationElement;

    const closeButtonElement = targetElement.querySelector(".close-button");
    if (closeButtonElement) {
      closeButtonElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling
        if (type === MessageType.INSTRUCTION) {
          this.hideInstruction();
        } else {
          this.hideConversation();
        }
      });
    }
  }

  public hideAll(): void {
    this.hideInstruction();
    this.hideConversation();
  }

  public hideInstruction(): void {
    this.instructionElement.style.display = "none";
    this.instructionsListElement.style.display = "none";
    this.instructionsButton.style.display = "block";
    this.currentlyShowingInstruction = false;
  }

  public hideConversation(): void {
    this.conversationElement.style.display = "none";
    this.currentlyShowingConversation = false;
  }

  // For backward compatibility, hide() will hide both message types
  public hide(): void {
    this.hideAll();
  }

  public showGameInstructions(): void {
    const version = pkg.version;
    const instructions = `
            <h3>Game Controls</h3>
            <p>Version: ${version}</p>
            <h4>Movement:</h4>
            <p>W - Move Forward</p>
            <p>S - Move Backward</p>
            <p>← - Rotate Left</p>
            <p>→ - Rotate Right</p>
            <p>↑ - Look Up (Max 60°)</p>
            <p>↓ - Look Down (Max 30°)</p>
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
  // Property to store original styles
  private _originalStyles: {
    position: string;
    top: string;
    left: string;
    maxWidth: string;
  } | null = null;

  public showLoading(): void {
    // Save original styles to restore later
    const originalPosition = this.instructionElement.style.position;
    const originalTop = this.instructionElement.style.top;
    const originalLeft = this.instructionElement.style.left;
    const originalMaxWidth = this.instructionElement.style.maxWidth;

    // Center the message on screen
    this.instructionElement.style.position = "absolute";
    this.instructionElement.style.top = "50%";
    this.instructionElement.style.left = "50%";
    this.instructionElement.style.transform = "translate(-50%, -50%)";
    this.instructionElement.style.maxWidth = "300px";

    const loadingMessage = `
    <div style="text-align: center;">
      <h3>Loading...</h3>
      <div class="loading-spinner" style="
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
      "></div>
      <p style="margin-top: 15px;">Initializing game...</p>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

    this.instructionElement.innerHTML = loadingMessage;
    this.instructionElement.style.display = "block";
    this.instructionsButton.style.display = "none";
    this.currentlyShowingInstruction = true;

    // Store original positions for restoring later
    this._originalStyles = {
      position: originalPosition,
      top: originalTop,
      left: originalLeft,
      maxWidth: originalMaxWidth,
    };
  }

  public hideLoading(): void {
    // Restore original position styles before hiding
    if (this._originalStyles) {
      this.instructionElement.style.position = this._originalStyles.position;
      this.instructionElement.style.top = this._originalStyles.top;
      this.instructionElement.style.left = this._originalStyles.left;
      this.instructionElement.style.maxWidth = this._originalStyles.maxWidth;
      this.instructionElement.style.transform = ""; // Remove transform
      this._originalStyles = null;
    }

    this.hideAll();
  }

  // Add a new instruction
  public addInstruction(title: string, content: string): void {
    const formattedContent = `<h3>${title}</h3>${content}`;
    this.show(formattedContent, MessageType.INSTRUCTION);
  }

  // Check if currently showing a message (either type)
  public isShowingMessage(): boolean {
    return (
      this.currentlyShowingInstruction || this.currentlyShowingConversation
    );
  }

  // Check if showing an instruction specifically
  public isShowingInstruction(): boolean {
    return this.currentlyShowingInstruction;
  }

  // Check if showing a conversation specifically
  public isShowingConversation(): boolean {
    return this.currentlyShowingConversation;
  }
}
