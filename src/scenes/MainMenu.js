import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
    this.waveTime = 0;
  }

  create() {
    // Minimalist background
    this.cameras.main.setBackgroundColor(0xedeff0);

    // --- Title Card ---
    const cardX = 512,
      cardY = 340,
      cardW = 800,
      cardH = 520,
      cardR = 32;
    const cardBorder = this.add.graphics();
    cardBorder.lineStyle(8, 0x8c969d, 1);
    cardBorder.strokeRoundedRect(
      cardX - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      cardR
    );
    cardBorder.fillStyle(0xf7fafd, 1);
    cardBorder.fillRoundedRect(
      cardX - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      cardR
    );

    // --- Wave image inside card ---
    const waveTexture = this.textures.get("grey_wave").getSourceImage();
    const waveNaturalW = waveTexture.width;
    const waveNaturalH = waveTexture.height;

    // Get title position for reference
    const titleY = cardY - 90;

    // Set horizontal and vertical margins for containment
    const horizontalMargin = 32;
    const verticalMarginTop = 24;
    const verticalMarginBottom = 24;

    // Calculate max allowed width and height for the wave
    const maxWaveW = cardW - 2 * horizontalMargin;
    const maxWaveH = cardH - (titleY - (cardY - cardH / 2)) - verticalMarginTop - verticalMarginBottom;

    // Scale wave to fit within both width and height constraints
    const scale = Math.min(maxWaveW / waveNaturalW, maxWaveH / waveNaturalH);
    const waveDisplayW = waveNaturalW * scale;
    const waveDisplayH = waveNaturalH * scale;

    // Position: top of wave is 24px below title, bottom stays above card edge
    const titleBottomY = titleY + 36; // Approximate bottom of title text
    const waveY = titleBottomY + verticalMarginTop + waveDisplayH / 2;


    const waveImg = this.add.image(cardX, waveY, "grey_wave").setOrigin(0.5, 0.5);
    waveImg.displayWidth = waveDisplayW;
    waveImg.displayHeight = waveDisplayH;
    // No tint needed, already grey
    waveImg.setAlpha(1); // Full opacity
    waveImg.setDepth(5);

    // --- Title text ---
    this.add
      .text(cardX, cardY - 90, "TIDES OF TIME", {
        fontFamily: "Arial Black",
        fontSize: 72,
        color: "#5a646d",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // --- Play button ---
    const playY = 700;
    const playW = 400,
      playH = 90,
      playR = 24;
    const playBtnG = this.add.graphics();
    playBtnG.lineStyle(8, 0x8c969d, 1);
    playBtnG.strokeRoundedRect(
      cardX - playW / 2,
      playY - playH / 2,
      playW,
      playH,
      playR
    );
    playBtnG.fillStyle(0xf7fafd, 1);
    playBtnG.fillRoundedRect(
      cardX - playW / 2,
      playY - playH / 2,
      playW,
      playH,
      playR
    );
    this.add
      .text(cardX, playY, "PLAY", {
        fontFamily: "Arial Black",
        fontSize: 56,
        color: "#5a646d",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);
    // Overlay transparent rectangle for interactivity
    const playBtnHit = this.add
      .rectangle(cardX, playY, playW, playH, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    playBtnHit.on("pointerdown", () => this.scene.start("Game"));
  }
}
