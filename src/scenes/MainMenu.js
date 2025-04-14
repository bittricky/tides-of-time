import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
    this.waveTime = 0;
  }

  create() {
    // Use Kenney backgrounds (same as Game scene)
    this.cameras.main.setBackgroundColor(0xdee6ea);

    // Sky
    this.sky = this.add.image(512, 384, 'sky').setOrigin(0.5).setDepth(0);
    this.sky.displayWidth = 1024;
    this.sky.displayHeight = 768;

    // Hills
    this.hills = this.add.image(512, 500, 'hills1').setOrigin(0.5, 1).setDepth(1);
    this.hills.displayWidth = 1024;
    this.hills.displayHeight = 300;

    // Grass
    this.ground = this.add.image(512, 600, 'grass1').setOrigin(0.5, 1).setDepth(2);
    this.ground.displayWidth = 1024;
    this.ground.displayHeight = 80;

    // Place a few trees for visual interest
    this.add.image(200, 520, 'tree01').setOrigin(0.5, 1).setDepth(3).setScale(0.8);
    this.add.image(350, 540, 'tree02').setOrigin(0.5, 1).setDepth(3).setScale(0.7);
    this.add.image(800, 530, 'tree03').setOrigin(0.5, 1).setDepth(3).setScale(0.9);

    // Add some clouds
    this.add.image(250, 120, 'cloud1').setOrigin(0.5).setDepth(4).setAlpha(0.9).setScale(1.1);
    this.add.image(700, 80, 'cloud2').setOrigin(0.5).setDepth(4).setAlpha(0.85).setScale(0.95);
    this.add.image(900, 180, 'cloud3').setOrigin(0.5).setDepth(4).setAlpha(0.8).setScale(1.2);

    // Title text
    this.add.text(512, 140, "TIDE & TIME", {
      fontFamily: "Arial Black",
      fontSize: 72,
      color: "#4a545d",
      stroke: "#ffffff",
      strokeThickness: 8,
      align: "center",
    }).setOrigin(0.5).setDepth(10);

    // Balance label
    this.add.text(860, 60, "BALANCE", {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#4a545d",
      backgroundColor: "#ffffffcc",
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
      align: "center",
    }).setOrigin(0.5).setDepth(10);

    // Play button (simple rounded rectangle with text)
    const playBtn = this.add.rectangle(512, 700, 320, 80, 0xffffff, 1).setStrokeStyle(6, 0x8c969d).setOrigin(0.5).setDepth(10).setInteractive();
    this.add.text(512, 700, "PLAY", {
      fontFamily: "Arial Black",
      fontSize: 48,
      color: "#4a545d",
      align: "center",
    }).setOrigin(0.5).setDepth(11);
    // Make button interactive
    playBtn.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
