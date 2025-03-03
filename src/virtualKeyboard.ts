import { Character } from "./character";
import { KeyboardButton } from "./keyboardButton";

export class VirtualKeyboard {
  private container: HTMLDivElement;
  private moveContainer: HTMLDivElement;
  private rotateContainer: HTMLDivElement;
  private forwardButton: HTMLButtonElement;
  private backwardButton: HTMLButtonElement;
  private yawLeftButton: HTMLButtonElement;
  private yawRightButton: HTMLButtonElement;
  private pitchUpButton: HTMLButtonElement;
  private pitchDownButton: HTMLButtonElement;
  private character: Character | null = null;
  private static instance: VirtualKeyboard | null = null;
  private isTouch: boolean = false;

  private constructor() {
    // Create main container for virtual keyboard
    this.container = document.createElement("div");
    this.container.className = "virtual-keyboard";
    this.container.style.position = "fixed";
    this.container.style.bottom = "100px"; // Leave space for keyboard button
    this.container.style.left = "0";
    this.container.style.right = "0";
    this.container.style.display = "flex";
    this.container.style.justifyContent = "space-between";
    this.container.style.padding = "0 20px";
    this.container.style.zIndex = "1000";
    this.container.style.userSelect = "none";
    this.container.style.touchAction = "none"; // Prevent default touch actions

    // Create move controls container (left side)
    this.moveContainer = document.createElement("div");
    this.moveContainer.style.display = "flex";
    this.moveContainer.style.flexDirection = "column";
    this.moveContainer.style.alignItems = "center";
    this.moveContainer.style.gap = "10px";

    // Create rotation controls container (right side)
    this.rotateContainer = document.createElement("div");
    this.rotateContainer.style.display = "flex";
    this.rotateContainer.style.flexDirection = "column";
    this.rotateContainer.style.alignItems = "center";
    this.rotateContainer.style.gap = "10px";

    // Create movement buttons
    this.forwardButton = this.createButton("W", "forward");
    this.backwardButton = this.createButton("S", "backward");

    // Create rotation buttons
    this.yawLeftButton = this.createButton("◀", "yawLeft");
    this.yawRightButton = this.createButton("▶", "yawRight");
    this.pitchUpButton = this.createButton("▲", "pitchUp");
    this.pitchDownButton = this.createButton("▼", "pitchDown");

    // Add labels
    const moveLabel = document.createElement("div");
    moveLabel.textContent = "Move";
    moveLabel.style.color = "white";
    moveLabel.style.textAlign = "center";
    moveLabel.style.marginBottom = "5px";
    moveLabel.style.fontSize = "14px";
    moveLabel.style.textShadow = "1px 1px 2px black";

    const rotateLabel = document.createElement("div");
    rotateLabel.textContent = "Rotate";
    rotateLabel.style.color = "white";
    rotateLabel.style.textAlign = "center";
    rotateLabel.style.marginBottom = "5px";
    rotateLabel.style.fontSize = "14px";
    rotateLabel.style.textShadow = "1px 1px 2px black";

    // Create movement button group
    const moveButtonGroup = document.createElement("div");
    moveButtonGroup.style.display = "flex";
    moveButtonGroup.style.flexDirection = "column";
    moveButtonGroup.style.gap = "10px";
    moveButtonGroup.appendChild(this.forwardButton);
    moveButtonGroup.appendChild(this.backwardButton);

    // Create horizontal rotation button group
    const yawButtonGroup = document.createElement("div");
    yawButtonGroup.style.display = "flex";
    yawButtonGroup.style.gap = "10px";
    yawButtonGroup.appendChild(this.yawLeftButton);
    yawButtonGroup.appendChild(this.yawRightButton);

    // Create vertical rotation button group
    const pitchButtonGroup = document.createElement("div");
    pitchButtonGroup.style.display = "flex";
    pitchButtonGroup.style.flexDirection = "column";
    pitchButtonGroup.style.gap = "10px";
    pitchButtonGroup.appendChild(this.pitchUpButton);
    pitchButtonGroup.appendChild(this.pitchDownButton);

    // Add buttons to containers
    this.moveContainer.appendChild(moveLabel);
    this.moveContainer.appendChild(moveButtonGroup);

    this.rotateContainer.appendChild(rotateLabel);
    this.rotateContainer.appendChild(pitchButtonGroup);
    this.rotateContainer.appendChild(yawButtonGroup);

    // Add containers to main container
    this.container.appendChild(this.moveContainer);
    this.container.appendChild(this.rotateContainer);

    // Add CSS for virtual keyboard
    this.addStyles();

    // Check if device has touch capability
    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Default to hidden for non-touch devices
    if (this.isTouch) {
      this.show();
    } else {
      this.hide(); // Show on touch devices by default
    }

    // Add to DOM
    document.body.appendChild(this.container);

    // Initialize keyboard toggle button and connect it to this virtual keyboard
    const keyboardButton = KeyboardButton.getInstance();
    keyboardButton.setToggleCallback((visible) => {
      if (!visible) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  public static getInstance(): VirtualKeyboard {
    if (!VirtualKeyboard.instance) {
      VirtualKeyboard.instance = new VirtualKeyboard();
    }
    return VirtualKeyboard.instance;
  }

  public setCharacter(character: Character): void {
    this.character = character;
  }

  private createButton(text: string, direction: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `vk-btn vk-${direction}`;
    button.innerText = text;
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.backgroundColor = "rgba(70, 70, 70, 0.8)";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.fontSize = "24px";
    button.style.fontWeight = "bold";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    button.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.5)";

    // Style based on button type
    if (direction.includes("forward")) {
      button.style.backgroundColor = "rgba(65, 105, 225, 0.8)"; // Royal blue
    } else if (direction.includes("backward")) {
      button.style.backgroundColor = "rgba(70, 130, 180, 0.8)"; // Steel blue
    } else if (direction.includes("yaw")) {
      button.style.backgroundColor = "rgba(139, 0, 139, 0.8)"; // Dark magenta
    } else if (direction.includes("pitch")) {
      button.style.backgroundColor = "rgba(148, 0, 211, 0.8)"; // Dark violet
    }

    // Touch events
    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.handleButtonPress(direction);
      button.style.transform = "scale(0.95)";
      button.style.opacity = "1";
    });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.handleButtonRelease(direction);
      button.style.transform = "scale(1)";
      button.style.opacity = "0.9";
    });

    // Also handle mouse events for testing on desktop
    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.handleButtonPress(direction);
      button.style.transform = "scale(0.95)";
      button.style.opacity = "1";
    });

    button.addEventListener("mouseup", (e) => {
      e.preventDefault();
      this.handleButtonRelease(direction);
      button.style.transform = "scale(1)";
      button.style.opacity = "0.9";
    });

    button.addEventListener("mouseleave", (e) => {
      this.handleButtonRelease(direction);
      button.style.transform = "scale(1)";
      button.style.opacity = "0.9";
    });

    return button;
  }

  private handleButtonPress(direction: string): void {
    if (!this.character) return;

    // Create a synthetic keyboard event
    const keyDownEvent = new KeyboardEvent("keydown", {
      code: this.getKeyCodeFromDirection(direction),
      bubbles: true,
    });

    // Dispatch event to document
    document.dispatchEvent(keyDownEvent);
  }

  private handleButtonRelease(direction: string): void {
    if (!this.character) return;

    // Create a synthetic keyboard event
    const keyUpEvent = new KeyboardEvent("keyup", {
      code: this.getKeyCodeFromDirection(direction),
      bubbles: true,
    });

    // Dispatch event to document
    document.dispatchEvent(keyUpEvent);
  }

  private getKeyCodeFromDirection(direction: string): string {
    switch (direction) {
      case "forward":
        return "KeyW";
      case "backward":
        return "KeyS";
      case "yawLeft":
        return "ArrowLeft";
      case "yawRight":
        return "ArrowRight";
      case "pitchUp":
        return "ArrowUp";
      case "pitchDown":
        return "ArrowDown";
      default:
        return "";
    }
  }

  public show(): void {
    this.container.style.display = "flex";
    // Update keyboard button state
    KeyboardButton.getInstance().setVisibility(true);
  }

  public hide(): void {
    this.container.style.display = "none";
    // Update keyboard button state
    KeyboardButton.getInstance().setVisibility(false);
  }

  private addStyles(): void {
    // Add CSS for virtual keyboard
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .virtual-keyboard {
        transition: opacity 0.3s ease;
        padding-bottom: env(safe-area-inset-bottom, 10px); /* For notched phones */
      }
      
      .virtual-keyboard button {
        transition: all 0.1s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        opacity: 0.9;
      }
      
      .virtual-keyboard button:active {
        transform: scale(0.95) !important;
        opacity: 1 !important;
      }
      
      /* Specific button styling */
      .vk-forward, .vk-backward {
        transition: transform 0.2s ease;
      }
      
      /* Ensure buttons are large enough on mobile */
      @media (max-width: 768px) {
        .virtual-keyboard button {
          width: 65px !important;
          height: 65px !important;
          font-size: 28px !important;
        }
      }
      
      /* Even larger for small screens */
      @media (max-width: 376px) {
        .virtual-keyboard button {
          width: 55px !important;
          height: 55px !important;
        }
      }
      
      /* Handle landscape mode */
      @media (max-height: 500px) {
        .virtual-keyboard {
          flex-direction: row;
          justify-content: space-between;
          bottom: 5px;
        }
        
        .virtual-keyboard button {
          width: 45px !important;
          height: 45px !important;
          font-size: 20px !important;
        }
      }
      
      /* Hide from screen readers */
      .virtual-keyboard {
        aria-hidden: true;
      }
    `;
    document.head.appendChild(styleElement);
  }
}
