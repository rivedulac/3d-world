// A separate module for the keyboard toggle button to ensure it loads correctly
export class KeyboardButton {
  private toggleButton: HTMLButtonElement;
  private isVisible: boolean = false;
  private onToggleCallback: ((visible: boolean) => void) | null = null;
  private static instance: KeyboardButton | null = null;

  private constructor() {
    // Create the button element
    this.toggleButton = document.createElement("button");
    this.toggleButton.innerText = "⌨️";
    this.toggleButton.id = "keyboard-toggle-btn";

    // Apply styles
    this.applyStyles();

    // Add event listener
    this.toggleButton.addEventListener("click", this.handleClick.bind(this));

    // Append to body
    document.body.appendChild(this.toggleButton);

    console.log("Keyboard toggle button created");
  }

  public static getInstance(): KeyboardButton {
    if (!KeyboardButton.instance) {
      KeyboardButton.instance = new KeyboardButton();
    }
    return KeyboardButton.instance;
  }

  private applyStyles(): void {
    const btn = this.toggleButton;

    // Apply inline styles for maximum compatibility
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
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
    btn.style.zIndex = "9999"; // Very high z-index to ensure visibility
    btn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    btn.style.transition = "all 0.2s ease";
    // Remove tap highlight on mobile (using the standard CSS property name)
    (btn.style as any)["-webkit-tap-highlight-color"] = "transparent";

    // Add hover styles
    btn.onmouseover = () => {
      btn.style.backgroundColor = "rgba(80, 80, 80, 0.9)";
      btn.style.transform = "scale(1.05)";
    };

    btn.onmouseout = () => {
      if (!this.isVisible) {
        btn.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
      }
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
    // Update button appearance to show state
    if (this.isVisible) {
      this.toggleButton.style.backgroundColor = "rgba(0, 120, 215, 0.8)"; // Blue when active
    } else {
      this.toggleButton.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
    }

    // Call the callback if set
    if (this.onToggleCallback) {
      this.onToggleCallback(this.isVisible);
    }
  }

  public setToggleCallback(callback: (visible: boolean) => void): void {
    this.onToggleCallback = callback;
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public setVisibility(visible: boolean): void {
    if (this.isVisible !== visible) {
      this.isVisible = visible;

      // Update button appearance
      if (this.isVisible) {
        this.toggleButton.style.backgroundColor = "rgba(0, 120, 215, 0.8)"; // Blue when active
      } else {
        this.toggleButton.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
      }
    }
  }
}
