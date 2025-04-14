import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
    this.waveTime = 0;
  }

  create() {
    // Colors (matching grayscale look)
    const bgColor = 0xf6f8f9;
    const boxColor = 0xffffff;
    const borderColor = 0x8c969d;
    const waveColor = 0xbfc5ca;
    const waveDarkColor = 0x8c969d;
    const treeColor = 0xbfc5ca;
    const textColor = "#4a545d";

    // Set background
    this.cameras.main.setBackgroundColor(bgColor);

    // Draw main bordered box
    const boxX = 80, boxY = 30, boxW = 640, boxH = 520, boxR = 24;
    const box = this.add.graphics();
    box.lineStyle(6, borderColor, 1);
    box.fillStyle(boxColor, 1);
    box.strokeRoundedRect(boxX, boxY, boxW, boxH, boxR);
    box.fillRoundedRect(boxX, boxY, boxW, boxH, boxR);

    // Draw horizon (land/sea split)
    const horizonY = boxY + 220;
    const horizon = this.add.graphics();
    horizon.lineStyle(2, waveColor, 1);
    horizon.strokeLineShape(new Phaser.Geom.Line(boxX, horizonY, boxX + boxW, horizonY));

    // Draw trees (simple triangles + rectangles)
    // Tree 1 (left)
    this.add.rectangle(boxX + 110, horizonY - 40, 16, 38, treeColor).setOrigin(0.5, 0);
    this.add.triangle(boxX + 110, horizonY - 40, 0, 40, 16, 0, 32, 40, treeColor).setOrigin(0.5, 1);
    // Tree 2 (center, taller)
    this.add.rectangle(boxX + 180, horizonY - 60, 16, 56, treeColor).setOrigin(0.5, 0);
    this.add.triangle(boxX + 180, horizonY - 60, 0, 56, 16, 0, 32, 56, treeColor).setOrigin(0.5, 1);
    // Tree 3 (right, small)
    this.add.rectangle(boxX + 230, horizonY - 32, 10, 28, treeColor).setOrigin(0.5, 0);
    this.add.triangle(boxX + 230, horizonY - 32, 0, 28, 10, 0, 20, 28, treeColor).setOrigin(0.5, 1);

    // Draw two sine waves for water (use graphics)
    const waveGraphics = this.add.graphics();
    // Top wave
    waveGraphics.lineStyle(4, waveColor, 1);
    waveGraphics.beginPath();
    for (let x = 0; x <= boxW; x += 2) {
      let y = horizonY + 32 + Math.sin((x / boxW) * Math.PI * 2) * 18;
      if (x === 0) waveGraphics.moveTo(boxX + x, y);
      else waveGraphics.lineTo(boxX + x, y);
    }
    waveGraphics.strokePath();
    // Bottom wave
    waveGraphics.lineStyle(6, waveDarkColor, 1);
    waveGraphics.beginPath();
    for (let x = 0; x <= boxW; x += 2) {
      let y = horizonY + 80 + Math.sin((x / boxW) * Math.PI * 2 + Math.PI / 2) * 22;
      if (x === 0) waveGraphics.moveTo(boxX + x, y);
      else waveGraphics.lineTo(boxX + x, y);
    }
    waveGraphics.strokePath();

    // Title text
    this.add.text(boxX + boxW / 2, boxY + 90, "TIDE & TIME", {
      fontFamily: "Arial Black",
      fontSize: 64,
      color: textColor,
      align: "center",
    }).setOrigin(0.5);

    // BALANCE label (rounded border)
    const balW = 150, balH = 48, balX = boxX + boxW - balW - 24, balY = boxY + 24;
    const balLabel = this.add.graphics();
    balLabel.lineStyle(5, borderColor, 1);
    balLabel.strokeRoundedRect(balX, balY, balW, balH, 16);
    this.add.text(balX + balW / 2, balY + balH / 2, "BALANCE", {
      fontFamily: "Arial Black",
      fontSize: 30,
      color: textColor,
      align: "center",
    }).setOrigin(0.5);

    // PLAY button (large rounded border rectangle)
    const playW = 340, playH = 80, playX = boxX + boxW / 2 - playW / 2, playY = boxY + boxH + 40;
    const playBtn = this.add.graphics();
    playBtn.lineStyle(8, borderColor, 1);
    playBtn.strokeRoundedRect(playX, playY, playW, playH, 22);
    // Play text
    const playText = this.add.text(playX + playW / 2, playY + playH / 2, "PLAY", {
      fontFamily: "Arial Black",
      fontSize: 46,
      color: textColor,
      align: "center",
    }).setOrigin(0.5);
    // Make button interactive
    const playZone = this.add.zone(playX, playY, playW, playH).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    playZone.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
