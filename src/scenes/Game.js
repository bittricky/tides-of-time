import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init()
    {
        // Game state variables
        this.waveHeight = 0.5; // 0 to 1, starting at middle (balanced)
        this.targetWaveHeight = 0.5;
        this.waveSpeed = 0.005; // Speed at which wave moves toward target
        this.naturalFluctuation = 0.0005; // Natural tide movement
        this.score = 0;
        this.gameTime = 0;
        this.isGameOver = false;
        
        // Balance metrics
        this.landHealth = 100; // Health of land ecosystem
        this.oceanHealth = 100; // Health of ocean ecosystem
        this.balanceThreshold = 0.15; // How far from center is considered balanced
    }

    create ()
    {
        // Set ocean-like background
        this.cameras.main.setBackgroundColor(0x0077be);
        
        // Create the shore/horizon line
        this.horizon = 384; // Middle of the screen
        this.horizonLine = this.add.rectangle(0, this.horizon, 1024, 2, 0xf0f0f0).setOrigin(0, 0.5);
        
        // Create the ocean
        this.oceanRect = this.add.rectangle(0, this.horizon, 1024, 768, 0x0099cc).setOrigin(0, 0);
        this.oceanRect.setAlpha(0.7);
        
        // Create the sand
        this.sandRect = this.add.rectangle(0, 0, 1024, this.horizon, 0xf0e68c).setOrigin(0, 0);
        this.sandRect.setAlpha(0.7);
        
        // Create wave visualization
        this.waveGraphics = this.add.graphics();
        
        // Create wave control area (draggable area)
        this.waveControl = this.add.rectangle(512, 700, 200, 50, 0xffffff, 0.5).setInteractive();
        this.waveControlIndicator = this.add.circle(512, 700, 15, 0xff0000);
        
        // Add text displays
        this.scoreText = this.add.text(20, 20, 'Score: 0', { 
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        this.landHealthText = this.add.text(20, 60, 'Land: 100%', { 
            fontFamily: 'Arial', 
            fontSize: 18, 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        this.oceanHealthText = this.add.text(20, 90, 'Ocean: 100%', { 
            fontFamily: 'Arial', 
            fontSize: 18, 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        this.balanceText = this.add.text(512, 50, 'BALANCED', { 
            fontFamily: 'Arial', 
            fontSize: 28, 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.balanceText.visible = false;
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Start the game loop
        this.time.addEvent({
            delay: 100,
            callback: this.updateGameState,
            callbackScope: this,
            loop: true
        });
    }
    
    setupInputHandlers() {
        // Make wave control draggable horizontally
        this.input.setDraggable(this.waveControl);
        
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Constrain to horizontal movement within bounds
            const minX = 412; // Left boundary
            const maxX = 612; // Right boundary
            
            let newX = Phaser.Math.Clamp(dragX, minX, maxX);
            gameObject.x = newX;
            this.waveControlIndicator.x = newX;
            
            // Convert position to target wave height (0-1)
            this.targetWaveHeight = (newX - minX) / (maxX - minX);
        });
        
        // Allow clicking/tapping anywhere to set the wave height
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > 600) { // Only in the bottom area
                const minX = 412;
                const maxX = 612;
                let newX = Phaser.Math.Clamp(pointer.x, minX, maxX);
                
                this.waveControl.x = newX;
                this.waveControlIndicator.x = newX;
                
                // Convert position to target wave height (0-1)
                this.targetWaveHeight = (newX - minX) / (maxX - minX);
            }
        });
    }
    
    updateGameState() {
        if (this.isGameOver) return;
        
        this.gameTime += 0.1;
        
        // Move wave height toward target with some momentum
        const diff = this.targetWaveHeight - this.waveHeight;
        this.waveHeight += diff * this.waveSpeed;
        
        // Add natural fluctuation to make it more challenging
        this.waveHeight += (Math.sin(this.gameTime * 0.1) * this.naturalFluctuation);
        
        // Keep within bounds
        this.waveHeight = Phaser.Math.Clamp(this.waveHeight, 0, 1);
        
        // Update visuals
        this.drawWave();
        
        // Calculate balance and impact on ecosystems
        this.updateEcosystemHealth();
        
        // Update score
        if (Math.abs(this.waveHeight - 0.5) < this.balanceThreshold) {
            this.score += 1;
            this.balanceText.visible = true;
        } else {
            this.balanceText.visible = false;
        }
        
        // Update UI
        this.scoreText.setText(`Score: ${this.score}`);
        this.landHealthText.setText(`Land: ${Math.floor(this.landHealth)}%`);
        this.oceanHealthText.setText(`Ocean: ${Math.floor(this.oceanHealth)}%`);
        
        // Check for game over
        if (this.landHealth <= 0 || this.oceanHealth <= 0) {
            this.endGame();
        }
    }
    
    drawWave() {
        // Clear previous drawing
        this.waveGraphics.clear();
        
        // Calculate wave height in pixels
        const waveY = this.horizon + ((0.5 - this.waveHeight) * 300);
        
        // Draw the ocean with a wave effect
        this.waveGraphics.fillStyle(0x0099cc, 0.8);
        this.waveGraphics.beginPath();
        
        // Start at left edge
        this.waveGraphics.moveTo(0, 768);
        
        // Draw bottom edge
        this.waveGraphics.lineTo(0, waveY);
        
        // Draw wavy top edge
        for (let x = 0; x < 1024; x += 10) {
            const y = waveY + Math.sin(x * 0.01 + this.gameTime * 0.1) * 10;
            this.waveGraphics.lineTo(x, y);
        }
        
        // Complete the shape
        this.waveGraphics.lineTo(1024, 768);
        this.waveGraphics.closePath();
        this.waveGraphics.fill();
        
        // Update ocean rectangle height
        this.oceanRect.y = waveY;
        this.oceanRect.height = 768 - waveY;
    }
    
    updateEcosystemHealth() {
        // Calculate imbalance (0 = perfect balance at 0.5, 1 = extreme at 0 or 1)
        const imbalance = Math.abs(this.waveHeight - 0.5) * 2;
        
        // Determine which ecosystem is suffering
        if (this.waveHeight < 0.5) {
            // Ocean is too low (tide out)
            this.oceanHealth -= imbalance * 0.5;
            
            // Land can recover a bit when not flooded
            this.landHealth += 0.1;
        } else if (this.waveHeight > 0.5) {
            // Land is flooded
            this.landHealth -= imbalance * 0.5;
            
            // Ocean can recover a bit
            this.oceanHealth += 0.1;
        }
        
        // Cap health values
        this.landHealth = Phaser.Math.Clamp(this.landHealth, 0, 100);
        this.oceanHealth = Phaser.Math.Clamp(this.oceanHealth, 0, 100);
    }
    
    endGame() {
        this.isGameOver = true;
        
        // Display game over message
        this.add.text(512, 384, 'Balance Lost', {
            fontFamily: 'Arial Black', 
            fontSize: 48, 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Allow clicking to restart
        this.time.delayedCall(2000, () => {
            this.input.once('pointerdown', () => {
                this.scene.start('GameOver', { score: this.score });
            });
        });
    }
    
    update() {
        // This is called every frame, but we're using the time event for game logic
        // to have more control over the update rate
    }
}
