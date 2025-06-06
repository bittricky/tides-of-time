# Tides of Time

A web-based game about balancing the tides and maintaining balance between land and ocean life. Built with Phaser 3 and Webpack for Gamedev.js Game Jam 2025 for the theme, `balance`.

> It's like [Flappy Bird](https://en.wikipedia.org/wiki/Flappy_Bird) but with Water


## Game Overview

Tides of Time invites players to experience balance by giving the player the power to influence the tides to create said balance. Guide the tide, maintain a balance, and witness the interplay between cause and effect.

## Features Completed

- **Core Gameplay:**
  - Oscillating tide mechanic with player input to influence direction.
  - Land and ocean life visuals that react to tide state.
  - Harmony meter and danger margin system.
- **Game Over & Retry:**
  - Game ends if tide reaches extremes or stays in danger margin too long.
  - Retry button and high score display on Game Over screen.
- **High Score Tracking:**
  - Local storage persistence for best score.
- **Debug Overlay:**
  - Real-time display of game state variables for development and bug tracking.
- **Robust Error Handling:**
  - Strict guards prevent invalid state (e.g., NaN values) from breaking gameplay.
  - Detailed logging for debugging.

## Technical Instructions

### Requirements
- [Node.js](https://nodejs.org)

### Setup & Running Locally
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The game will be available at [http://localhost:8080](http://localhost:8080).
3. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist` folder.

### Project Structure
- `src/` — Main game source code (scenes, logic, assets)
- `public/` — Static assets (images, audio, etc.)
- `index.html` — Main HTML entry point

### Philosophical Inspiration: 

> [Daoism](https://en.wikipedia.org/wiki/Daoism), [Zen](https://en.wikipedia.org/wiki/Zen), [Advaita Vedanta](https://en.wikipedia.org/wiki/Advaita_Vedanta), and the general principles of the Art of Balance

**Effortless Action:** 

The game is an invitation to get into a [state of flow](https://en.wikipedia.org/wiki/Wu_wei). Without excessive thought or analysis, the player gently guides the flow, responding to what is happening in the moment. The most skillful play emerges from attentive, non-coercive presence.

**Cyclical Interdependence:** 

The oscillation of land and sea, the dance of danger and safety, reflect the ever-changing, cyclical nature of existence. Each action creates ripples; each moment of balance is both an end and a new beginning. Dualities are not opposites to be conquered, but partners in a dynamic, living whole. An [Ecology](https://en.wikipedia.org/wiki/Ecology).

**Non-Dual Awareness:** 

Drawing from [Zen](https://en.wikipedia.org/wiki/Zen) and [Advaita Vedanta](https://en.wikipedia.org/wiki/Advaita_Vedanta), the game aims to dissolve the boundary between what is the player and what is the system. **There is no "winning" against the tide**, only the opportunity to participate in its unfolding. The experience that it aims to invoke in the player is a meditative state, the feeling of welcoming change, the feeling of accepting impermanence, and delight in the interplay of cause and effect. To try and simulate the experience of what [samadhi](https://en.wikipedia.org/wiki/Samadhi) might be.

> Can there be a true distinction between the self and the nature it seeks to conquer?

---


## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the webpack documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Webpack will automatically recompile your code and then reload the browser.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

- `index.html` - A basic HTML page to contain the game.
- `src` - Contains the game source code.
- `src/main.js` - The main entry point. This contains the game configuration and starts the game.
- `src/scenes/` - The Phaser Scenes are in this folder.
- `public/style.css` - Some simple CSS rules to help with page layout.
- `public/assets` - Contains the static assets used by the game.

## Handling Assets

Webpack supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Babel

You can write modern ES6+ JavaScript and Babel will transpile it to a version of JavaScript that you want your project to support. The targeted browsers are set in the `.babelrc` file and the default currently targets all browsers with total usage over "0.25%" but excludes IE11 and Opera Mini.

 ```
"browsers": [
  ">0.25%",
  "not ie 11",
  "not op_mini all"
]
 ```

### Webpack

If you want to customize your build, such as adding a new webpack loader or plugin (i.e. for loading CSS or fonts), you can modify the `webpack/config.js` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Webpack documentation](https://webpack.js.org/) for more information.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Join the Phaser Community!

They love to see what developers like you create with Phaser! It really motivates them to keep improving. So please join their community and show-off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow [Phaser](https://bsky.app/profile/phaser.io)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join them on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created with [Phaser Studio](mailto:support@phaser.io).

----------------

### **"Thou Art That"**
