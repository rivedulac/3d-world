import { gameInstance } from "./gameInstance";

// Import package.json using ES modules syntax
import pkg from "../package.json";

export class MessageSystem {
  private messageElement: HTMLDivElement;
  private static instance: MessageSystem | null = null;

  private constructor() {
    // Create message container
    this.messageElement = document.createElement("div");
    this.messageElement.style.position = "absolute";
    this.messageElement.style.top = "5%";
    this.messageElement.style.left = "5%";
    this.messageElement.style.transform = "none";
    this.messageElement.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    this.messageElement.style.color = "white";
    this.messageElement.style.padding = "20px";
    this.messageElement.style.borderRadius = "5px";
    this.messageElement.style.fontFamily = "Arial, sans-serif";
    this.messageElement.style.zIndex = "1000";
    this.messageElement.style.cursor = "pointer";
    this.messageElement.style.display = "none";
    this.messageElement.style.maxWidth = "300px";

    // Add event listeners
    this.messageElement.addEventListener("click", () => this.hide());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hide();
      }
    });

    document.body.appendChild(this.messageElement);
  }

  public static getInstance(): MessageSystem {
    if (!MessageSystem.instance) {
      MessageSystem.instance = new MessageSystem();
    }
    return MessageSystem.instance;
  }

  public show(message: string): void {
    this.messageElement.innerHTML = message;
    this.messageElement.style.display = "block";
  }

  public hide(): void {
    this.messageElement.style.display = "none";
  }

  public showGameInstructions(): void {
    const version = pkg.version;
    const instructions = `
            <h3>Version: ${version}</h3>
            <h3>Controls:</h3>
            <p>W - Move Forward</p>
            <p>A - Rotate Left</p>
            <p>S - Move Backward</p>
            <p>D - Rotate Right</p>
            <p><small>(Click or press ESC to close)</small></p>
        `;
    this.show(instructions);
  }
}
