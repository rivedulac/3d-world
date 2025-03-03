import { gameInstance } from "./gameInstance";

export class ViewResetButton {
  private resetButton: HTMLButtonElement;
  private static instance: ViewResetButton | null = null;

  private constructor() {
    // Create the button element
    this.resetButton = document.createElement("button");
    this.resetButton.innerText = "👁️";
    this.resetButton.id = "view-reset-btn";

    // Apply styles
    this.applyStyles();

    // Add event listener
    this.resetButton.addEventListener("click", this.handleClick.bind(this));

    // Append to body
    document.body.appendChild(this.resetButton);

    console.log("View reset button created");
  }

  public static getInstance(): ViewResetButton {
    if (!ViewResetButton.instance) {
      ViewResetButton.instance = new ViewResetButton();
    }
    return ViewResetButton.instance;
  }

  private applyStyles(): void {
    const btn = this.resetButton;

    // Similar styling to KeyboardButton
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "90px"; // Position next to keyboard button
    btn.style.width = "60px";
    btn.style.height = "60px";
    btn.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.fontSize = "30px";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.zIndex = "9999";
    btn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    btn.style.transition = "all 0.2s ease";
    (btn.style as any)["-webkit-tap-highlight-color"] = "transparent";

    // Add hover styles
    btn.onmouseover = () => {
      btn.style.backgroundColor = "rgba(80, 80, 80, 0.9)";
      btn.style.transform = "scale(1.05)";
    };

    btn.onmouseout = () => {
      btn.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
      btn.style.transform = "scale(1)";
    };

    // Add active styles
    btn.onmousedown = () => {
      btn.style.transform = "scale(0.95)";
    };

    btn.onmouseup = () => {
      btn.style.transform = "scale(1)";
    };
  }

  private handleClick(): void {
    // Check if character exists in the game instance
    if (gameInstance.character) {
      // Reset the camera view to its default orientation
      gameInstance.character.resetCameraView();
    }
  }
}
