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

    // --- UI: Harmony Meter ---
    this.harmonyG = this.add.graphics().setDepth(100);
    // Draw thick border
    this.harmonyG.lineStyle(6, 0x222f3e, 1);
    this.harmonyG.strokeRoundedRect(40, 40, 48, 160, 16);
    // Draw 'balanced' zone highlight
    this.harmonyG.fillStyle(0xc7f7d3, 0.4);
    this.harmonyG.fillRoundedRect(42, 40 + 160 * 0.33, 44, 160 * 0.34, 12);
    // Draw meter ticks
    this.harmonyG.lineStyle(2, 0x444444, 1);
    for (let i = 0; i < 6; i++) {
      this.harmonyG.lineBetween(40, 40 + i * 32, 88, 40 + i * 32);
    }
    this.harmonyTextLow = this.add.text(98, 52, "Low", {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#444",
    });
    this.harmonyTextBal = this.add.text(98, 100, "Balanced", {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#444",
    });
    this.harmonyTextHigh = this.add.text(98, 168, "High", {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#444",
    });
    this.harmonyMeter = this.add.graphics().setDepth(101);
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

    // --- Land/Ocean (simple, stylized) ---
    const landG = this.add.graphics();
    landG.lineStyle(3, 0x888888, 1);
    landG.beginPath();
    landG.moveTo(0, 320);
    for (let x = 0; x <= 1024; x += 24) {
      let y = 320 + Math.sin(x * 0.008) * 22;
      landG.lineTo(x, y);
    }
    landG.lineTo(1024, 420);
    landG.lineTo(0, 420);
    landG.closePath();
    landG.strokePath();
    landG.fillStyle(0xf5f5f5, 1);
    landG.fillPath();

    // --- Ocean (wavy lines) ---
    const oceanG = this.add.graphics();
    oceanG.lineStyle(3, 0x888888, 1);
    for (let i = 0; i < 6; i++) {
      let waveY = 440 + i * 32;
      oceanG.beginPath();
      for (let x = 0; x <= 1024; x += 16) {
        let y = waveY + Math.sin(x * 0.012 + i * 1.2) * 14;
        oceanG.lineTo(x, y);
      }
      oceanG.strokePath();
    }

    // --- Placeholder Animals/Life ---
    // --- Placeholder Animals/Life (with pulse animation state) ---
    this.landAnimals = [
      this.add.ellipse(250, 290, 38, 24, 0xcccccc), // tree
      this.add.ellipse(410, 300, 38, 24, 0xcccccc), // tree
      this.add.ellipse(600, 280, 32, 22, 0xcccccc), // crab
    ];
    this.oceanLife = [
      this.add.ellipse(200, 500, 34, 18, 0xcccccc), // fish
      this.add.ellipse(420, 540, 24, 24, 0xcccccc), // coral
      this.add.ellipse(800, 520, 34, 18, 0xcccccc), // fish
    ];
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
    this.sendBtnG.lineStyle(4, 0x888888, 1);
    this.sendBtnG.strokeRoundedRect(180, 630, btnW, btnH, btnR);
    this.sendBtnText = this.add
      .text(310, 665, "SEND WAVE", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#444",
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
    this.easeBtnG.lineStyle(4, 0x888888, 1);
    this.easeBtnG.strokeRoundedRect(584, 630, btnW, btnH, btnR);
    this.easeBtnText = this.add
      .text(714, 665, "EASE TIDE", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#444",
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
        this.sendBtnG.lineStyle(4, on ? 0x1d3557 : 0x888888, 1);
        this.sendBtnG.strokeRoundedRect(180, 630, btnW, btnH, btnR);
        this.sendBtnText.setColor(on ? "#1d3557" : "#444");
      } else if (which === "ease") {
        this.easeBtnG.clear();
        this.easeBtnG.lineStyle(4, on ? 0x1d3557 : 0x888888, 1);
        this.easeBtnG.strokeRoundedRect(584, 630, btnW, btnH, btnR);
        this.easeBtnText.setColor(on ? "#1d3557" : "#444");
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
    // Check for true game over at the very start
    if (this.tide <= 0 || this.tide >= 1) {
      if (!this.gameOver) {
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
    const osc = Math.sin(this.oscPhase) * this.oscAmp;
    // Player force
    if (this.tideDir !== 0) {
      this.playerForce += this.tideDir * 0.018;
    } else {
      // Decay player force gradually
      this.playerForce *= 0.94;
      if (Math.abs(this.playerForce) < 0.002) this.playerForce = 0;
    }
    // Clamp player force
    this.playerForce = Phaser.Math.Clamp(this.playerForce, -0.4, 0.4);
    // The actual tide is the sum of the oscillation and player force, centered at 0.5
    // Oscillates between nearly 0 and 1
    this.tide = Phaser.Math.Clamp(0.5 + osc + this.playerForce, 0, 1);

    // Animate animal/coral pulse
    this.animalPulse = (this.animalPulse || 0) + 0.07;
    // Harmony state
    const inBalanced = this.tide >= 0.33 && this.tide <= 0.67;
    // Update harmony meter
    this.updateHarmonyMeter(inBalanced);
    // Animals react
    for (let a of this.landAnimals) {
      if (this.tide < 0.33) {
        a.setFillStyle(0xffcccc, 1);
        a.setScale(0.8 + 0.04 * Math.sin(this.animalPulse * 3));
      } else if (this.tide > 0.67) {
        a.setFillStyle(0xffe5b0, 1);
        a.setScale(0.85 + 0.03 * Math.sin(this.animalPulse * 4));
      } else {
        a.setFillStyle(0x7cf7a7, 1);
        a.setScale(1.05 + 0.07 * Math.sin(this.animalPulse)); // pulse
      }
    }
    for (let o of this.oceanLife) {
      if (this.tide > 0.67) {
        o.setFillStyle(0xccddff, 1);
        o.setScale(0.8 + 0.04 * Math.sin(this.animalPulse * 2));
      } else if (this.tide < 0.33) {
        o.setFillStyle(0xe0e0e0, 1);
        o.setScale(0.85 + 0.03 * Math.sin(this.animalPulse * 3));
      } else {
        o.setFillStyle(0x7cf7a7, 1);
        o.setScale(1.05 + 0.07 * Math.sin(this.animalPulse + 1)); // pulse
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
        // Show high score on game over
        let msg =
          "Game Over:\n You've fallen out of balance\nScore: " +
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
      }
      // If not controlling, still update score display in case it was updated elsewhere
      else {
        this.scoreText.setText("Score: " + Math.round(this.score));
      }
    }
  }

  updateHarmonyMeter(inBalanced) {
    this.harmonyMeter.clear();
    // Glow or color change for danger
    if (!inBalanced) {
      this.harmonyMeter.lineStyle(8, 0xff4d4d, 0.7);
      this.harmonyMeter.strokeRoundedRect(40, 40, 48, 160, 16);
    }
    // Indicator
    let y = 40 + (1 - this.tide) * 160;
    let color = inBalanced ? 0xffe066 : 0xff4d4d; // yellow if balanced, red if danger
    this.harmonyMeter.fillStyle(color, 1);
    this.harmonyMeter.fillRoundedRect(46, y - 12, 40, 24, 8);
    // Numeric display
    let harmonyPct = Math.round((1 - Math.abs(this.tide - 0.5) * 2) * 100);
    this.harmonyValueText.setText(harmonyPct + "%");
    this.harmonyValueText.setColor(inBalanced ? "#228b22" : "#b22222");
  }
}
