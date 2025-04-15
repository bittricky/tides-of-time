import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
    // Instance properties for state
    this.tide = 0.5;
    this.tideDir = 0;
    this.tideTimer = 0;
    this.gameOver = false;
  }

  create() {
    // --- GAME STATE ---
    this.tide = 0.5; // 0 = low, 1 = high, 0.5 = balanced
    this.tideDir = 0; // -1 = lowering, 1 = raising, 0 = stable
    this.tideTimer = 0; // How long tide is out of balance
    this.gameOver = false;

    // --- UI: Harmony Meter ---
    this.harmonyG = this.add.graphics();
    this.harmonyG.lineStyle(2, 0x444444, 1);
    this.harmonyG.strokeRect(40, 40, 36, 120);
    for (let i = 0; i < 5; i++) {
        this.harmonyG.strokeRect(40, 40 + i * 24, 36, 24);
    }
    this.harmonyTextLow = this.add.text(90, 52, 'Low', { fontFamily: 'Arial', fontSize: 24, color: '#444' });
    this.harmonyTextBal = this.add.text(90, 100, 'Balanced', { fontFamily: 'Arial', fontSize: 24, color: '#444' });
    this.harmonyTextHigh = this.add.text(90, 148, 'High', { fontFamily: 'Arial', fontSize: 24, color: '#444' });
    this.harmonyMeter = this.add.graphics();

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

    // --- Harmony Meter Title ---
    this.add.text(512, 28, 'Harmony Meter', { fontFamily: 'Arial', fontSize: 36, color: '#444' }).setOrigin(0.5);

    // --- Controls: SEND WAVE / EASE TIDE ---
    const btnW = 260, btnH = 68, btnR = 16;
    const sendBtnG = this.add.graphics();
    sendBtnG.lineStyle(4, 0x888888, 1);
    sendBtnG.strokeRoundedRect(180, 630, btnW, btnH, btnR);
    this.add.text(310, 665, 'SEND WAVE', { fontFamily: 'Arial Black', fontSize: 32, color: '#444' }).setOrigin(0.5);
    const sendBtnHit = this.add.rectangle(180+btnW/2, 630+btnH/2, btnW, btnH, 0x000000, 0).setInteractive({useHandCursor:true});
    sendBtnHit.on('pointerdown', () => { this.tideDir = 1; });
    const easeBtnG = this.add.graphics();
    easeBtnG.lineStyle(4, 0x888888, 1);
    easeBtnG.strokeRoundedRect(584, 630, btnW, btnH, btnR);
    this.add.text(714, 665, 'EASE TIDE', { fontFamily: 'Arial Black', fontSize: 32, color: '#444' }).setOrigin(0.5);
    const easeBtnHit = this.add.rectangle(584+btnW/2, 630+btnH/2, btnW, btnH, 0x000000, 0).setInteractive({useHandCursor:true});
    easeBtnHit.on('pointerdown', () => { this.tideDir = -1; });

    // --- Drag/tap controls ---
    this.input.on('pointerup', () => { this.tideDir = 0; });
    this.input.on('pointerout', () => { this.tideDir = 0; });

    // --- Game Over Text (hidden by default) ---
    this.gameOverText = this.add.text(512, 384, '', { fontFamily: 'Arial Black', fontSize: 64, color: '#a33', align: 'center' }).setOrigin(0.5).setDepth(20);
  }

  update() {
    if (this.gameOver) return;
    // Update tide
    if (this.tideDir !== 0) {
      this.tide += this.tideDir * 0.0025;
      this.tide = Phaser.Math.Clamp(this.tide, 0, 1);
    }
    // Update harmony meter
    this.updateHarmonyMeter();
    // Animals react
    for (let a of this.landAnimals) {
      a.setFillStyle(this.tide < 0.3 ? 0xffcccc : 0xcccccc);
    }
    for (let o of this.oceanLife) {
      o.setFillStyle(this.tide > 0.7 ? 0xccddff : 0xcccccc);
    }
    // Lose if out of balance too long
    if (this.tide < 0.08 || this.tide > 0.92) {
      this.tideTimer += 1;
      if (this.tideTimer > 180) { // ~3s
        this.gameOver = true;
        this.gameOverText.setText('Game Over\nOut of Balance');
      }
    } else {
      this.tideTimer = 0;
      this.gameOverText.setText('');
    }
  }

  updateHarmonyMeter() {
    this.harmonyMeter.clear();
    let y = 40 + (1-this.tide)*120;
    this.harmonyMeter.fillStyle(0x4dbbe6, 1);
    this.harmonyMeter.fillRect(42, y-8, 32, 16);
  }
}
