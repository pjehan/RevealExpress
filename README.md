# RevealExpress

> ExpressJS server to show your RevealJS presentation and add interaction with your audience

## What is RevealExpress

Start revealexpress inside your presentation folder, share the URL with your audience and start your interactive presentation.

## Instructions

#### 1 - Install RevealExpress globally

You must have [NodeJS](https://nodejs.org/en/) 22.12 or later and [NPM](https://www.npmjs.org) already installed.
In your console, run:

<sup>(You may need to add `sudo` at start)</sup>

```shell script
npm install -g revealexpress
```

#### 2 - Launch RevealExpress inside your presentation folder

In your console, navigate to your project folder.
Then launch RevealExpress:

```shell script
cd ./my-awesome-presentation
revealexpress
```

RevealExpress should open in your default browser and build a presentation based on your HTML files.

#### 3 - Share the URL with your audience

Simply share the URL that should appear and your audience will have access to your presentation through RevealExpress.
By default, you must be on the same network.

## Features

- Work in any modern browser
- Open in default browser
- Accessible by anyone on the same network
- Audience can follow your presentation in real time
- Presenter mode protected by a password (remembered until the browser tab is closed)
- Quiz with live answer counters that the presenter can show or hide (hidden by default)

### Additional features

#### PrismJS

You can include [PrismJS](https://prismjs.com) in your slideshow using Webpack and [babel-plugin-prismjs](https://www.npmjs.com/package/babel-plugin-prismjs).

## Configuration

### Command arguments

You can pass arguments to the `revealexpress` command to customize the slideshow:

```shell script
revealexpress -n="My slideshow" -p=5000 --revealjs.slideNumber=0
```

On a server, add `--no-open` to avoid opening a browser at startup.

You can use the `--help` flag to list every available arguments:

```shell script
revealexpress --help
```

You can also create a `slideshow.config.js` file in your presentation folder to send arguments to RevealExpress (command arguments take precedence over this file):

```js
module.exports = {
  name: 'My slideshow',
  lang: 'en', // Language of the slides (default: 'fr')
  port: 5000,
  password: 'my-secret',
  revealjs: {
    slideNumber: 0,
  },
  stylesheets: ['assets/css/style.css'],
  javascripts: ['assets/js/script.js'],
};
```

### RevealJS API

RevealJS expose an [API](https://revealjs.com/api/) to let you listen or trigger events and configure the slideshow.

The `Reveal` object is accessible once the slideshow has been loaded. You can listen to the 'loaded' event and then use the `event.detail.Reveal` object within the listener callback function:

```js
document.getElementById('revealexpress').addEventListener('loaded', function (event) {
  event.detail.Reveal.next();
});
```

> :warning: You should always **wait for the slideshow to be loaded** before interacting with it!

## Development

Development requires Node.js 22.18 or later (TypeScript files are run directly by Node.js).

```shell script
npm install
npm run dev -- --path ../my-awesome-presentation # Server restarts and browser reloads on changes
npm test
npx playwright install chromium # Once, before running end-to-end tests
npm run test:e2e
npm run lint
npm run build # Build the package in dist/
```

## Credits

##### Development

- Pierre Jehan ([GitHub](https://github.com/pjehan), [Site](https://www.pierre-jehan.com))

This project was inspired by the [Keppler](https://github.com/brunosimon/keppler) project.
