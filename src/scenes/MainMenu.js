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
    const cardX = 512, cardY = 340, cardW = 800, cardH = 520, cardR = 32;
    const cardBorder = this.add.graphics();
    cardBorder.lineStyle(8, 0x8c969d, 1);
    cardBorder.strokeRoundedRect(cardX-cardW/2, cardY-cardH/2, cardW, cardH, cardR);
    cardBorder.fillStyle(0xf7fafd, 1);
    cardBorder.fillRoundedRect(cardX-cardW/2, cardY-cardH/2, cardW, cardH, cardR);

    // --- Balance label ---
    const balW = 160, balH = 54, balR = 18;
    const balX = cardX + cardW/2 - balW/2 - 32, balY = cardY - cardH/2 + balH/2 + 32;
    const balG = this.add.graphics();
    balG.lineStyle(6, 0x8c969d, 1);
    balG.strokeRoundedRect(balX-balW/2, balY-balH/2, balW, balH, balR);
    balG.fillStyle(0xf7fafd, 1);
    balG.fillRoundedRect(balX-balW/2, balY-balH/2, balW, balH, balR);
    this.add.text(balX, balY, "BALANCE", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#79808a",
      align: "center"
    }).setOrigin(0.5).setDepth(10);

    // --- Stylized landscape inside card ---
    const landG = this.add.graphics().setDepth(1);
    // Horizon
    landG.lineStyle(0, 0, 0);
    landG.fillStyle(0xdbe1e4, 1);
    landG.fillRect(cardX-cardW/2+32, cardY, cardW-64, cardH/2-32);
    // Trees (simple triangles)
    function drawTree(g, x, y, size) {
      g.fillStyle(0xadb6bc, 1);
      g.beginPath();
      g.moveTo(x, y-size*1.2);
      g.lineTo(x-size, y+size);
      g.lineTo(x+size, y+size);
      g.closePath();
      g.fillPath();
      g.fillRect(x-size/5, y+size, size*0.4, size*1.1);
    }
    drawTree(landG, cardX-80, cardY+60, 38);
    drawTree(landG, cardX, cardY+40, 54);
    drawTree(landG, cardX+70, cardY+64, 30);
    // Ocean - two wavy lines
    landG.lineStyle(8, 0xaeb6bb, 1);
    for (let i=0; i<2; i++) {
      let waveY = cardY+cardH/4 + 34*i;
      landG.beginPath();
      for (let x = cardX-cardW/2+40, j=0; x <= cardX+cardW/2-40; x+=8, j++) {
        let y = waveY + Math.sin(j*0.14 + i*Math.PI/2) * 22;
        if (x === cardX-cardW/2+40) landG.moveTo(x, y);
        else landG.lineTo(x, y);
      }
      landG.strokePath();
    }
    // Lower land (darker)
    landG.fillStyle(0xb0b6bb, 1);
    landG.beginPath();
    landG.moveTo(cardX-cardW/2+32, cardY+cardH/4+48);
    for (let x = cardX-cardW/2+32, j=0; x <= cardX+cardW/2-32; x+=8, j++) {
      let y = cardY+cardH/4+48 + Math.sin(j*0.13 + 1.1) * 38;
      landG.lineTo(x, y);
    }
    landG.lineTo(cardX+cardW/2-32, cardY+cardH/2-32);
    landG.lineTo(cardX-cardW/2+32, cardY+cardH/2-32);
    landG.closePath();
    landG.fillPath();

    // --- Title text ---
    this.add.text(cardX, cardY-90, "TIDES OF TIME", {
      fontFamily: "Arial Black",
      fontSize: 72,
      color: "#5a646d",
      align: "center"
    }).setOrigin(0.5).setDepth(10);

    // --- Play button ---
    const playY = 700;
    const playW = 400, playH = 90, playR = 24;
    const playBtnG = this.add.graphics();
    playBtnG.lineStyle(8, 0x8c969d, 1);
    playBtnG.strokeRoundedRect(cardX-playW/2, playY-playH/2, playW, playH, playR);
    playBtnG.fillStyle(0xf7fafd, 1);
    playBtnG.fillRoundedRect(cardX-playW/2, playY-playH/2, playW, playH, playR);
    this.add.text(cardX, playY, "PLAY", {
      fontFamily: "Arial Black",
      fontSize: 56,
      color: "#5a646d",
      align: "center"
    }).setOrigin(0.5).setDepth(10);
    // Overlay transparent rectangle for interactivity
    const playBtnHit = this.add.rectangle(cardX, playY, playW, playH, 0x000000, 0).setOrigin(0.5).setInteractive({useHandCursor: true});
    playBtnHit.on('pointerdown', () => this.scene.start('Game'));
  }
}

