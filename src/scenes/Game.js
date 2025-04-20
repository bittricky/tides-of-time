import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
    // Instance properties for state
    this.tide = 0.5;
    this.tideDir = 0;
    this.tideTimer = 0;
    this.gameOver = false;
  }

  create() {
    // --- GAME STATE ---
    // Oscillation variables
    this.oscPhase = 0;
    this.oscSpeed = 0.018 + Math.random() * 0.012; // slightly faster
    this.oscAmp = 0.46 + Math.random() * 0.08; // amplitude large enough to reach ends
    this.playerForce = 0; // player-applied force
    this.tide = 0.5; // 0 = low, 1 = high, 0.5 = balanced
    this.tideDir = 0; // -1 = lowering, 1 = raising, 0 = stable
    this.tideTimer = 0; // How long tide is out of balance
    this.gameOver = false;

    // --- HIGH SCORE ---
    // Load high score from localStorage or default to 0
    this.highScore = Number(window.localStorage.getItem("highScore")) || 0;

    // --- UI: Harmony Meter (atlas-based, create before updateHarmonyMeter) ---
    // Use atlas keys: 'harmony_meter' for indicator, 'meter_bg' for background
    // PIXEL-PERFECT DRAWN BALANCE METER (matches water_meter.png)
    const meterX = 64,
      meterY = 120,
      meterW = 52,
      meterH = 160,
      meterR = 12;
    const bandH = meterH / 4;
    // Colors from the PNG (approximate)
    const colorTop = 0xe4efe5;
    const colorBand1 = 0xb5d8db;
    const colorBand2 = 0x7bc0c9;
    const colorBand3 = 0x3e8c99;
    const colorDivider = 0xd0c39d;
    const colorWavy = 0xb5d8db;
    const labelColor = "#a0915d";
    // Draw meter background (rounded rect)
    this.harmonyMeterG = this.add.graphics({ x: 0, y: 0 }).setDepth(99);
    this.harmonyMeterG.fillStyle(colorTop, 1);
    this.harmonyMeterG.fillRoundedRect(
      meterX - meterW / 2,
      meterY,
      meterW,
      meterH,
      meterR
    );
    // Draw color bands (from top to bottom)
    this.harmonyMeterG.fillStyle(colorBand1, 1);
    this.harmonyMeterG.fillRect(
      meterX - meterW / 2,
      meterY + bandH,
      meterW,
      bandH
    );
    this.harmonyMeterG.fillStyle(colorBand2, 1);
    this.harmonyMeterG.fillRect(
      meterX - meterW / 2,
      meterY + 2 * bandH,
      meterW,
      bandH
    );
    this.harmonyMeterG.fillStyle(colorBand3, 1);
    this.harmonyMeterG.fillRect(
      meterX - meterW / 2,
      meterY + 3 * bandH,
      meterW,
      bandH
    );
    // Draw dividing lines
    this.harmonyMeterG.lineStyle(2, colorDivider, 1);
    for (let i = 1; i < 4; i++) {
      this.harmonyMeterG.strokeLineShape(
        new Phaser.Geom.Line(
          meterX - meterW / 2,
          meterY + i * bandH,
          meterX + meterW / 2,
          meterY + i * bandH
        )
      );
    }
    // Draw wavy water line at the top of band 1
    this.harmonyMeterG.lineStyle(2, colorWavy, 1);
    this.harmonyMeterG.beginPath();
    for (let i = 0; i <= meterW; i += 2) {
      const wx = meterX - meterW / 2 + i;
      const wy = meterY + bandH + Math.sin(i / 10) * 6;
      if (i === 0) this.harmonyMeterG.moveTo(wx, wy);
      else this.harmonyMeterG.lineTo(wx, wy);
    }
    this.harmonyMeterG.strokePath();
    // Draw vertical label bar
    this.harmonyMeterG.lineStyle(5, colorDivider, 1);
    this.harmonyMeterG.strokeLineShape(
      new Phaser.Geom.Line(
        meterX - meterW / 2 - 32,
        meterY,
        meterX - meterW / 2 - 32,
        meterY + meterH
      )
    );
    // Draw only the vertical label bar as a visual separator
    const labelBarX = meterX - meterW / 2 - 32;
    const labelBar = this.add.graphics({ x: 0, y: 0 }).setDepth(199);
    labelBar.lineStyle(4, colorDivider, 1);
    labelBar.strokeLineShape(
      new Phaser.Geom.Line(labelBarX, meterY, labelBarX, meterY + meterH)
    );
    // Add back text labels LOW, BALANCED, HIGH in the meter's color scheme
    const labelFont = {
      fontFamily: "Arial Black",
      fontSize: 28,
      color: "#a0915d",
      fontStyle: "bold",
    };
    this.add
      .text(labelBarX - 10, meterY + 2, "LOW", labelFont)
      .setOrigin(1, 0)
      .setDepth(300);
    this.add
      .text(labelBarX - 10, meterY + meterH / 2, "BALANCED", labelFont)
      .setOrigin(1, 0.5)
      .setDepth(300);
    this.add
      .text(labelBarX - 10, meterY + meterH - 2, "HIGH", labelFont)
      .setOrigin(1, 1)
      .setDepth(300);
    // Indicator rectangle sized to fit inside the meter
    this.harmonyMeterIndicator = this.add
      .rectangle(meterX, meterY, 48, 16, 0xffe066)
      .setOrigin(0.5, 0)
      .setDepth(100);
    this.harmonyValueText = this.add
      .text(64, 210, "", {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#222",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(102);

    // --- Harmony Meter Indicator (updates in update()) ---
    this.updateHarmonyMeter();

    // --- Visual Background ---
    this.add.image(512, 384, "beach").setDepth(-10).setDisplaySize(1024, 768);

    // --- Land/Ocean (remove old graphics) ---
    // (Old landG and oceanG code removed for clarity)

    // --- Nature Sprites ---
    // Use frames from 'natureElements' spritesheet:
    // Example: 0 = palm tree, 1 = pine tree, 2 = bush, 3 = rock, 4 = crab, 5 = fish, 6 = coral, etc.
    // --- Land Elements (trees, bush, rock, crab) ---
    try {
      // --- Land Elements (trees, crab, bird, etc.) using atlas keys ---
      this.landElements = [
        this.add.sprite(140, 270, "natureElements", "tree1").setScale(0.7),
        this.add.sprite(200, 285, "natureElements", "tree2").setScale(0.7),
        this.add.sprite(260, 295, "natureElements", "tree3").setScale(0.7),
        this.add.sprite(320, 305, "natureElements", "tree4").setScale(0.7),
        this.add.sprite(380, 320, "natureElements", "crab").setScale(0.6),
        this.add.sprite(440, 255, "natureElements", "bird").setScale(0.7),
        this.add.sprite(70, 220, "natureElements", "cloud").setScale(0.9),
      ];
      // --- Ocean Elements (fish, seaweed, coral) using atlas keys ---
      this.oceanElements = [
        this.add.sprite(200, 520, "natureElements", "fish").setScale(0.7),
        this.add
          .sprite(320, 570, "natureElements", "fish")
          .setScale(0.7)
          .setFlipX(true),
        this.add.sprite(420, 560, "natureElements", "seaweed1").setScale(0.7),
        this.add.sprite(600, 540, "natureElements", "seaweed2").setScale(0.7),
        this.add.sprite(700, 570, "natureElements", "coral1").setScale(0.7),
        this.add.sprite(800, 600, "natureElements", "coral2").setScale(0.7),
        this.add.sprite(900, 550, "natureElements", "seaweed3").setScale(0.7),
      ];
      // --- Wave Sprites for Tides (hidden by default, shown on action) ---
      this.waveSend = this.add
        .sprite(512, 384, "natureElements", "wave")
        .setScale(1.1)
        .setVisible(false);
      this.waveEase = this.add
        .sprite(512, 384, "natureElements", "wave")
        .setScale(1.1)
        .setFlipX(true)
        .setVisible(false);
    } catch (e) {
      console.error("Failed to create sprites from natureElements:", e);
      // Fallback: draw debug rectangles if sprites are missing
      this.landElements = [
        this.add.rectangle(140, 270, 64, 64, 0x00ff00),
        this.add.rectangle(230, 300, 64, 64, 0x00ff00),
        this.add.rectangle(320, 320, 64, 64, 0x00ff00),
        this.add.rectangle(400, 340, 64, 64, 0x00ff00),
        this.add.rectangle(480, 330, 64, 64, 0x00ff00),
      ];
      this.oceanElements = [
        this.add.rectangle(200, 520, 64, 64, 0x0000ff),
        this.add.rectangle(320, 570, 64, 64, 0x0000ff),
        this.add.rectangle(420, 560, 64, 64, 0x0000ff),
        this.add.rectangle(600, 540, 64, 64, 0x0000ff),
        this.add.rectangle(700, 570, 64, 64, 0x0000ff),
      ];
      this.waveSend = this.add
        .rectangle(512, 384, 128, 32, 0x00ffff)
        .setVisible(false);
      this.waveEase = this.add
        .rectangle(512, 384, 128, 32, 0x00ffff)
        .setVisible(false);
    }
    this.animalPulse = 0; // for pulse animation

    // --- SCORE (move after meter, before controls) ---
    this.score = 0;
    this.scoreText = this.add
      .text(512, 40, "Score: 0", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#222",
        align: "center",
      })
      .setOrigin(0.5);

    this.highScoreText = this.add
      .text(512, 75, `High Score: ${this.highScore}`, {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#b8860b",
        align: "center",
      })
      .setOrigin(0.5);

    // --- Controls: SEND WAVE / EASE TIDE ---
    const btnW = 260,
      btnH = 68,
      btnR = 16;
    // Store graphics for highlighting
    this.sendBtnG = this.add.graphics();
    this.sendBtnG.lineStyle(4, 0xffe066, 1);
    this.sendBtnG.fillStyle(0xffe066, 1);
    this.sendBtnG.fillRoundedRect(180, 630, btnW, btnH, btnR);
    this.sendBtnG.strokeRoundedRect(180, 630, btnW, btnH, btnR);
    this.sendBtnText = this.add
      .text(310, 665, "SEND WAVE", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#bfa200",
      })
      .setOrigin(0.5);
    const sendBtnHit = this.add
      .rectangle(180 + btnW / 2, 630 + btnH / 2, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    sendBtnHit.on("pointerdown", () => {
      this.tideDir = 1;
      this.highlightButton("send", true);
    });
    sendBtnHit.on("pointerup", () => {
      this.tideDir = 0;
      this.highlightButton("send", false);
    });
    sendBtnHit.on("pointerout", () => {
      this.tideDir = 0;
      this.highlightButton("send", false);
    });

    this.easeBtnG = this.add.graphics();
    this.easeBtnG.lineStyle(4, 0xffe066, 1);
    this.easeBtnG.fillStyle(0xffe066, 1);
    this.easeBtnG.fillRoundedRect(584, 630, btnW, btnH, btnR);
    this.easeBtnG.strokeRoundedRect(584, 630, btnW, btnH, btnR);
    this.easeBtnText = this.add
      .text(714, 665, "EASE TIDE", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#bfa200",
      })
      .setOrigin(0.5);
    const easeBtnHit = this.add
      .rectangle(584 + btnW / 2, 630 + btnH / 2, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    easeBtnHit.on("pointerdown", () => {
      this.tideDir = -1;
      this.highlightButton("ease", true);
    });
    easeBtnHit.on("pointerup", () => {
      this.tideDir = 0;
      this.highlightButton("ease", false);
    });
    easeBtnHit.on("pointerout", () => {
      this.tideDir = 0;
      this.highlightButton("ease", false);
    });

    // --- Key Mapping Description ---
    this.keyDescText = this.add
      .text(512, 600, "[A] or [←] = EASE TIDE   |   [D] or [→] = SEND WAVE", {
        fontFamily: "Arial",
        fontSize: 22,
        color: "#444",
        align: "center",
      })
      .setOrigin(0.5);

    // --- Keyboard controls ---
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });
    this.input.keyboard.on("keydown", (event) => {
      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        this.tideDir = -1;
        this.highlightButton("ease", true);
      } else if (event.code === "KeyD" || event.code === "ArrowRight") {
        this.tideDir = 1;
        this.highlightButton("send", true);
      }
    });
    this.input.keyboard.on("keyup", (event) => {
      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        this.tideDir = 0;
        this.highlightButton("ease", false);
      } else if (event.code === "KeyD" || event.code === "ArrowRight") {
        this.tideDir = 0;
        this.highlightButton("send", false);
      }
    });

    // --- Helper for button highlighting ---
    this.highlightButton = (which, on) => {
      if (which === "send") {
        this.sendBtnG.clear();
        this.sendBtnG.lineStyle(4, on ? 0xffe066 : 0xffe066, 1);
        this.sendBtnG.fillStyle(on ? 0xffe066 : 0xffe066, 1);
        this.sendBtnG.fillRoundedRect(180, 630, btnW, btnH, btnR);
        this.sendBtnG.strokeRoundedRect(180, 630, btnW, btnH, btnR);
        this.sendBtnText.setColor(on ? "#bfa200" : "#bfa200");
      } else if (which === "ease") {
        this.easeBtnG.clear();
        this.easeBtnG.lineStyle(4, on ? 0xffe066 : 0xffe066, 1);
        this.easeBtnG.fillStyle(on ? 0xffe066 : 0xffe066, 1);
        this.easeBtnG.fillRoundedRect(584, 630, btnW, btnH, btnR);
        this.easeBtnG.strokeRoundedRect(584, 630, btnW, btnH, btnR);
        this.easeBtnText.setColor(on ? "#bfa200" : "#bfa200");
      }
    };

    // --- Game Over Text (hidden by default) ---
    this.gameOverText = this.add
      .text(512, 384, "", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#a33",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(20);

    // --- Retry Button (hidden by default) ---
    this.retryBtnG = this.add.graphics().setDepth(21);
    this.retryBtnG.lineStyle(6, 0x1d3557, 1);
    this.retryBtnG.strokeRoundedRect(362, 470, 300, 70, 22);
    this.retryBtnG.fillStyle(0xf7fafd, 1);
    this.retryBtnG.fillRoundedRect(362, 470, 300, 70, 22);
    this.retryBtnText = this.add
      .text(512, 505, "RETRY", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#1d3557",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(22);
    this.retryBtnHit = this.add
      .rectangle(512, 505, 300, 70, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(23);
    this.retryBtnG.setVisible(false);
    this.retryBtnText.setVisible(false);
    this.retryBtnHit.setVisible(false);
    this.retryBtnHit.on("pointerdown", () => {
      console.log("[DEBUG] Retry button pressed, restarting scene.");
      this.scene.restart();
    });
    // Hide retry if restarting
    this.events.on("shutdown", () => {
      this.retryBtnG.setVisible(false);
      this.retryBtnText.setVisible(false);
      this.retryBtnHit.setVisible(false);
    });
  }

  update() {
    // DEBUG: overlay update
    // Defensive: check for invalid state
    let warningMsg = "";
    // Strict guards: immediately reset and warn if invalid
    if (typeof this.tide !== "number" || isNaN(this.tide)) {
      warningMsg += "tide INVALID\n";
      console.warn("[CRITICAL] tide was invalid, resetting to 0.5");
      this.tide = 0.5;
    }
    if (typeof this.tideDir !== "number" || isNaN(this.tideDir)) {
      warningMsg += "tideDir INVALID\n";
      console.warn("[CRITICAL] tideDir was invalid, resetting to 0");
      this.tideDir = 0;
    }
    if (typeof this.dangerTimer !== "number" || isNaN(this.dangerTimer)) {
      warningMsg += "dangerTimer INVALID\n";
      console.warn("[CRITICAL] dangerTimer was invalid, resetting to 0");
      this.dangerTimer = 0;
    }
    if (typeof this.score !== "number" || isNaN(this.score)) {
      warningMsg += "score INVALID\n";
      console.warn("[CRITICAL] score was invalid, resetting to 0");
      this.score = 0;
    }
    if (typeof this.highScore !== "number" || isNaN(this.highScore)) {
      warningMsg += "highScore INVALID\n";
      console.warn("[CRITICAL] highScore was invalid, resetting to 0");
      this.highScore = 0;
    }
    // Failsafe: if any variable was invalid, log a warning but DO NOT force game over
    if (warningMsg) {
      console.warn(
        "[WARNING] Invalid state detected, but not forcing game over:",
        warningMsg
      );
      // Optionally, you can display a warning overlay or highlight, but do not set gameOver here
    }
    if (this.debugText) {
      this.debugText.setText(
        `gameOver: ${this.gameOver}\n` +
          `tide: ${this.tide}\n` +
          `tideDir: ${this.tideDir}\n` +
          `score: ${this.score}\n` +
          `highScore: ${this.highScore}\n` +
          `dangerTimer: ${this.dangerTimer}` +
          (warningMsg ? "\n[WARNING]\n" + warningMsg : "")
      );
    }
    if (warningMsg) {
      console.warn("[WARNING] Invalid game state detected:", warningMsg);
    }
    // Check for true game over at the very start
    if (this.tide <= 0 || this.tide >= 1) {
      if (!this.gameOver) {
        console.log(
          "[DEBUG] Game over triggered: tide at extreme. tide=" + this.tide
        );
        this.gameOver = true;
        // Show high score on game over
        let msg =
          "Game Over:\n You've been overwhelmed by the tides \nScore: " +
          Math.round(this.score) +
          "\nHigh Score: " +
          Math.round(this.highScore);
        this.gameOverText.setText(msg);
        this.retryBtnG.setVisible(true);
        this.retryBtnText.setVisible(true);
        this.retryBtnHit.setVisible(true);
      }
      return;
    }
    if (this.gameOver) return;
    // Oscillation phase update
    this.oscPhase += this.oscSpeed;
    // Difficulty ramp: increase amplitude and speed over time
    this.difficultyTimer += 1;
    if (this.oscAmp < 0.499) this.oscAmp += 0.00005; // ramp amplitude, cap at 0.499
    if (this.oscSpeed < 0.045) this.oscSpeed += 0.000015; // ramp speed
    // Occasionally randomize speed for unpredictability
    if (Math.random() < 0.005)
      this.oscSpeed =
        0.016 + Math.random() * 0.014 + 0.00001 * this.difficultyTimer;
    // Compute oscillation
    let osc = Math.sin(this.oscPhase) * this.oscAmp;
    if (typeof osc !== "number" || isNaN(osc)) {
      console.warn("[CRITICAL] osc was invalid, resetting to 0");
      osc = 0;
    }
    // Player force
    if (this.tideDir !== 0) {
      this.playerForce += this.tideDir * 0.018;
    } else {
      // Decay player force gradually
      this.playerForce *= 0.94;
      if (Math.abs(this.playerForce) < 0.002) this.playerForce = 0;
    }
    // Clamp player force
    if (typeof this.playerForce !== "number" || isNaN(this.playerForce)) {
      console.warn("[CRITICAL] playerForce was invalid, resetting to 0");
      this.playerForce = 0;
    }
    this.playerForce = Phaser.Math.Clamp(this.playerForce, -0.4, 0.4);
    // The actual tide is the sum of the oscillation and player force, centered at 0.5
    // Oscillates between nearly 0 and 1
    let computedTide = 0.5 + osc + this.playerForce;
    if (typeof computedTide !== "number" || isNaN(computedTide)) {
      console.warn("[CRITICAL] computedTide was invalid, resetting to 0.5");
      computedTide = 0.5;
    }
    this.tide = Phaser.Math.Clamp(computedTide, 0, 1);

    // --- DETAILED LOGGING ---
    if (!this.gameOver) {
      console.log(
        `[FRAME] tide=${this.tide} tideDir=${this.tideDir} dangerTimer=${this.dangerTimer} score=${this.score}`
      );
    }

    // Animate animal/coral pulse
    this.animalPulse = (this.animalPulse || 0) + 0.07;
    // Harmony state
    const inBalanced = this.tide >= 0.33 && this.tide <= 0.67;
    // Update harmony meter
    this.updateHarmonyMeter(inBalanced);
    // Land elements (trees/animals) react
    for (let a of this.landElements) {
      if (this.tide < 0.33) {
        a.setTint(0xffcccc); // danger - too low
        a.setScale(0.8 + 0.04 * Math.sin(this.animalPulse * 3));
      } else if (this.tide > 0.67) {
        a.setTint(0xffe5b0); // danger - too high
        a.setScale(0.85 + 0.03 * Math.sin(this.animalPulse * 4));
      } else {
        a.clearTint(); // balanced
        a.setScale(1.05 + 0.07 * Math.sin(this.animalPulse)); // pulse
      }
    }
    // Ocean elements (fish/coral) react
    for (let o of this.oceanElements) {
      if (this.tide < 0.33) {
        o.setTint(0x66ccff); // danger - too low
        o.setScale(0.9 + 0.04 * Math.cos(this.animalPulse * 2));
      } else if (this.tide > 0.67) {
        o.setTint(0x2266ff); // danger - too high
        o.setScale(0.85 + 0.03 * Math.cos(this.animalPulse * 3));
      } else {
        o.clearTint(); // balanced
        o.setScale(1.05 + 0.07 * Math.cos(this.animalPulse * 1.5));
      }
    }
    // Game over if meter reaches either end
    // Danger margin at both ends
    const inDangerMargin = this.tide < 0.08 || this.tide > 0.92;
    if (!this.dangerTimer) this.dangerTimer = 0;
    if (inDangerMargin) {
      this.dangerTimer += 1;
      if (this.dangerTimer > 120) {
        // 2 seconds in danger margin
        this.gameOver = true;
        console.log(
          "[DEBUG] Game over triggered: danger margin timeout. tide=" +
            this.tide
        );
        // Show high score on game over
        let msg =
          "Game Over:\n The tides lingered at the edge too long\nScore: " +
          Math.round(this.score) +
          "\nHigh Score: " +
          Math.round(this.highScore);
        this.gameOverText.setText(msg);
        this.retryBtnG.setVisible(true);
        this.retryBtnText.setVisible(true);
        this.retryBtnHit.setVisible(true);
        return;
      }
    } else {
      this.dangerTimer = 0;
    }
    // Immediate game over if meter is at the absolute ends
    if (this.tide <= 0 || this.tide >= 1) {
      this.gameOver = true;
      console.log(
        "[DEBUG] Game over triggered: tide at extreme. tide=" + this.tide
      );
      this.gameOverText.setText(
        "Game Over:\n You've been overwhelmed by the tides \nScore: " +
          Math.round(this.score)
      );
      this.retryBtnG.setVisible(true);
      this.retryBtnText.setVisible(true);
      this.retryBtnHit.setVisible(true);
      return;
    }
    // Lose if out of balance too long
    if (this.tide < 0.33 || this.tide > 0.67) {
      this.tideTimer += 1;
      if (this.tideTimer > 180) {
        // ~3s
        this.gameOver = true;
        console.log(
          "[DEBUG] Game over triggered: out of balance too long. tide=" +
            this.tide
        );
        // Show high score on game over
        let msg =
          "Game Over:\n The flow was broken. Balance is a practice.\nScore: " +
          Math.round(this.score) +
          "\nHigh Score: " +
          Math.round(this.highScore);
        this.gameOverText.setText(msg);
        this.retryBtnG.setVisible(true);
        this.retryBtnText.setVisible(true);
        this.retryBtnHit.setVisible(true);
      }
    } else {
      this.tideTimer = 0;
      this.gameOverText.setText("");
      this.retryBtnG.setVisible(false);
      this.retryBtnText.setVisible(false);
      this.retryBtnHit.setVisible(false);
      // Score logic: increment only if player is actively controlling
      if (this.tideDir !== 0) {
        this.score += 1 / 60; // 1 point per second in balance
        this.scoreText.setText("Score: " + Math.round(this.score));
      } else {
        this.scoreText.setText("Score: " + Math.round(this.score));
      }
    }
  }

  updateHarmonyMeter(inBalanced) {
    // Defensive: ensure tide is a number
    let tide =
      typeof this.tide === "number" && !isNaN(this.tide) ? this.tide : 0.5;
    // Move indicator sprite along the meter
    // The meter background's top is at y=120, height ~160px
    let indicatorY = 120 + (1 - tide) * 160;
    if (this.harmonyMeterIndicator) {
      this.harmonyMeterIndicator.y = indicatorY;
      // Only tint if the indicator supports setTint (i.e., is a Sprite or Image)
      if (typeof this.harmonyMeterIndicator.setTint === "function") {
        if (inBalanced) {
          this.harmonyMeterIndicator.setTint(0xffe066);
          if (
            this.harmonyMeterBg &&
            typeof this.harmonyMeterBg.setAlpha === "function"
          )
            this.harmonyMeterBg.setAlpha(1);
        } else {
          this.harmonyMeterIndicator.setTint(0xff4d4d);
          if (
            this.harmonyMeterBg &&
            typeof this.harmonyMeterBg.setAlpha === "function"
          )
            this.harmonyMeterBg.setAlpha(0.8);
        }
      } else {
        // Rectangle: change fillColor instead
        if (inBalanced) {
          this.harmonyMeterIndicator.fillColor = 0xffe066;
          if (
            this.harmonyMeterBg &&
            typeof this.harmonyMeterBg.setAlpha === "function"
          )
            this.harmonyMeterBg.setAlpha(1);
        } else {
          this.harmonyMeterIndicator.fillColor = 0xff4d4d;
          if (
            this.harmonyMeterBg &&
            typeof this.harmonyMeterBg.setAlpha === "function"
          )
            this.harmonyMeterBg.setAlpha(0.8);
        }
      }
    } else {
      console.warn("harmonyMeterIndicator is undefined");
    }
    // Numeric display
    let harmonyPct = Math.round((1 - Math.abs(tide - 0.5) * 2) * 100);
    this.harmonyValueText.setText(harmonyPct + "%");
    this.harmonyValueText.setColor(inBalanced ? "#228b22" : "#b22222");
  }
}
