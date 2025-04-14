import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        // Load the assets for the game (open source placeholders)
        this.load.setPath('assets');

        // Kenney backgrounds (PNG/Flat)
        this.load.image('sky', 'PNG/Flat/sky.png');
        this.load.image('hills1', 'PNG/Flat/hills1.png');
        this.load.image('hills2', 'PNG/Flat/hills2.png');
        this.load.image('grass1', 'PNG/Flat/grass1.png');
        this.load.image('grass2', 'PNG/Flat/grass2.png');
        this.load.image('tree01', 'PNG/Flat/tree01.png');
        this.load.image('tree02', 'PNG/Flat/tree02.png');
        this.load.image('tree03', 'PNG/Flat/tree03.png');
        this.load.image('cloud1', 'PNG/Flat/cloud1.png');
        this.load.image('cloud2', 'PNG/Flat/cloud2.png');
        this.load.image('cloud3', 'PNG/Flat/cloud3.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
