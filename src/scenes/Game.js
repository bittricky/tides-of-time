import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  // No game state logic needed for visual-only scene

  create() {
    // --- Sky ---
    this.cameras.main.setBackgroundColor(0xd6ecf6); // Softer pale blue

    // --- Clouds (large, soft, overlapping) ---
    const cloudG = this.add.graphics().setDepth(1);
    cloudG.fillStyle(0xeaf6fb, 0.85);
    cloudG.fillEllipse(200, 160, 180, 80);
    cloudG.fillEllipse(320, 180, 130, 60);
    cloudG.fillEllipse(420, 140, 170, 80);
    cloudG.fillEllipse(700, 120, 220, 90);
    cloudG.fillEllipse(850, 170, 150, 70);

    // --- Rolling Hill ---
    const landG = this.add.graphics().setDepth(2);
    landG.fillStyle(0xa89f99, 1); // Brown/grey
    landG.beginPath();
    // Draw a sine wave for the hill top
    const hillBaseY = 520;
    const hillAmplitude = 50;
    const hillFrequency = 2 * Math.PI / 1024 * 2; // 2 cycles across width
    landG.moveTo(0, hillBaseY);
    for (let x = 0; x <= 1024; x += 8) {
        const y = hillBaseY + Math.sin(x * hillFrequency) * hillAmplitude;
        landG.lineTo(x, y);
    }
    landG.lineTo(1024, 768);
    landG.lineTo(0, 768);
    landG.closePath();
    landG.fillPath();

    // --- Trees on the hill (angled trunks, proper placement) ---
    function drawTree(g, x, y, scale=1, trunkSlant=0) {
        // Trunk (optionally slanted)
        g.fillStyle(0x7c5a3a, 1);
        g.beginPath();
        g.moveTo(x-7*scale + trunkSlant, y);
        g.lineTo(x+7*scale + trunkSlant, y);
        g.lineTo(x+7*scale, y+40*scale);
        g.lineTo(x-7*scale, y+40*scale);
        g.closePath();
        g.fillPath();
        // Bottom triangle
        g.fillStyle(0x3b8a5a, 1);
        g.beginPath();
        g.moveTo(x, y-10*scale);
        g.lineTo(x-32*scale, y+30*scale);
        g.lineTo(x+32*scale, y+30*scale);
        g.closePath();
        g.fillPath();
        // Middle triangle
        g.beginPath();
        g.moveTo(x, y-32*scale);
        g.lineTo(x-24*scale, y+8*scale);
        g.lineTo(x+24*scale, y+8*scale);
        g.closePath();
        g.fillPath();
        // Top triangle
        g.beginPath();
        g.moveTo(x, y-52*scale);
        g.lineTo(x-16*scale, y-12*scale);
        g.lineTo(x+16*scale, y-12*scale);
        g.closePath();
        g.fillPath();
    }
    const treeG = this.add.graphics().setDepth(3);
    // Trees placed to sit on the hill curve
    function hillY(x) {
        const hillBaseY = 520;
        const hillAmplitude = 50;
        const hillFrequency = 2 * Math.PI / 1024 * 2;
        return hillBaseY + Math.sin(x * hillFrequency) * hillAmplitude;
    }
    drawTree(treeG, 170, hillY(170), 1.15, -8);
    drawTree(treeG, 320, hillY(320), 0.9, 4);
    drawTree(treeG, 470, hillY(470), 1.3, 0);
    drawTree(treeG, 670, hillY(670), 1.0, -5);
    drawTree(treeG, 850, hillY(850), 0.8, 7);

    // --- Ocean (multi-layered, wavy) ---
    const baseY = 600;
    const oceanColors = [0x7fd3e6, 0x4dbbe6, 0x3494c7];
    const oceanDepths = [4, 5, 6];
    const waveAmplitudes = [10, 16, 22];
    const waveFrequencies = [0.012, 0.018, 0.025];
    for (let l = 0; l < 3; l++) {
        const g = this.add.graphics().setDepth(oceanDepths[l]);
        g.fillStyle(oceanColors[l], 1);
        g.beginPath();
        for (let x = 0; x <= 1024; x += 8) {
            const y = baseY + (l * 20) + Math.sin(x * waveFrequencies[l]) * waveAmplitudes[l];
            if (x === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
        }
        g.lineTo(1024, 768);
        g.lineTo(0, 768);
        g.closePath();
        g.fillPath();
    }
  }
}
