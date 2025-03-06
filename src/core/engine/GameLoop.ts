export class GameLoop {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor() {
    this.initializeGame();
  }

  private initializeGame(): void {
    // Initialize game systems, entities, etc.
    console.log("Game initialized");
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.tick();
    console.log("Game started");
  }

  public stop(): void {
    if (!this.isRunning) return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isRunning = false;
    console.log("Game stopped");
  }

  private tick = (): void => {
    // Update game state
    this.update();
    // Render frame
    this.render();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private update(): void {
    // Update game logic, physics, etc.
  }

  private render(): void {
    // Render game state
  }

  public destroy(): void {
    this.stop();
    // Cleanup resources
    console.log("Game destroyed");
  }
}
