import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
    this.waveTime = 0;
  }

  create() {
    // Set ocean-like background
    this.cameras.main.setBackgroundColor(0x0077be);

    // Create animated water background
    this.waveGraphics = this.add.graphics();

    // Game title
    this.add
      .text(512, 180, "Tides of Time", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(512, 250, "A Meditative Wave Balancer", {
        fontFamily: "Arial",
        fontSize: 28,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);

    // Game description
    const description = [
      "Balance the tides between land and sea.",
      "Let the tide rise too high and land life suffers.",
      "Let it fall too low and ocean life dries out.",
      "Find harmony between the two worlds.",
      "Balance is not achieved through force, but is revealed in stillness, when the self flows with the Way, and duality dissolves into one.",
    ];

    // Add description text
    this.add
      .text(512, 340, description, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    // Instructions
    this.add
      .text(512, 450, "Drag left/right to control the waves", {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);

    // Create play button
    const playButton = this.add.rectangle(512, 550, 200, 60, 0x4a6fa5, 0.8);
    playButton.setInteractive({ useHandCursor: true });

    const playText = this.add
      .text(512, 550, "Play Game", {
        fontFamily: "Arial",
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Button hover effects
    playButton.on("pointerover", () => {
      playButton.fillColor = 0x6c8cbf;
    });

    playButton.on("pointerout", () => {
      playButton.fillColor = 0x4a6fa5;
    });

    // Start game on button click
    playButton.on("pointerdown", () => {
      this.scene.start("Game");
    });

    // Create animated wave effect
    this.time.addEvent({
      delay: 50,
      callback: this.updateWaves,
      callbackScope: this,
      loop: true,
    });
  }

  updateWaves() {
    this.waveTime += 0.05;

    // Clear previous drawing
    this.waveGraphics.clear();

    // Draw animated waves at the bottom
    this.waveGraphics.fillStyle(0x0099cc, 0.6);
    this.waveGraphics.beginPath();

    // Start at bottom left
    this.waveGraphics.moveTo(0, 768);

    // Draw wavy top edge
    for (let x = 0; x < 1024; x += 10) {
      const y = 600 + Math.sin(x * 0.01 + this.waveTime) * 20;
      this.waveGraphics.lineTo(x, y);
    }

    // Complete the shape
    this.waveGraphics.lineTo(1024, 768);
    this.waveGraphics.closePath();
    this.waveGraphics.fill();
  }
}
