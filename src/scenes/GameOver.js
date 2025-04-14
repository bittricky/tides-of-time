import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    init(data)
    {
        // Get the score from the Game scene
        this.score = data.score || 0;
    }

    create ()
    {
        // Set a calming blue background
        this.cameras.main.setBackgroundColor(0x1a3c5e);

        // Add background with water effect
        const bg = this.add.rectangle(0, 0, 1024, 768, 0x0077be).setOrigin(0, 0);
        bg.setAlpha(0.3);

        // Game over title
        this.add.text(512, 200, 'Balance Lost', {
            fontFamily: 'Arial Black', 
            fontSize: 64, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Display final score
        this.add.text(512, 300, `Your Score: ${this.score}`, {
            fontFamily: 'Arial', 
            fontSize: 48, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Add some flavor text about balance
        this.add.text(512, 380, 'The delicate balance of nature requires constant attention.', {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Create restart button
        const restartButton = this.add.rectangle(512, 480, 200, 60, 0x4a6fa5, 0.8);
        restartButton.setInteractive({ useHandCursor: true });
        
        const restartText = this.add.text(512, 480, 'Play Again', {
            fontFamily: 'Arial', 
            fontSize: 28, 
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create main menu button
        const menuButton = this.add.rectangle(512, 560, 200, 60, 0x4a6fa5, 0.8);
        menuButton.setInteractive({ useHandCursor: true });
        
        const menuText = this.add.text(512, 560, 'Main Menu', {
            fontFamily: 'Arial', 
            fontSize: 28, 
            color: '#ffffff'
        }).setOrigin(0.5);

        // Button hover effects
        restartButton.on('pointerover', () => {
            restartButton.fillColor = 0x6c8cbf;
        });
        
        restartButton.on('pointerout', () => {
            restartButton.fillColor = 0x4a6fa5;
        });
        
        menuButton.on('pointerover', () => {
            menuButton.fillColor = 0x6c8cbf;
        });
        
        menuButton.on('pointerout', () => {
            menuButton.fillColor = 0x4a6fa5;
        });

        // Button click handlers
        restartButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
