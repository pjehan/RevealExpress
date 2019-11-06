# RevealExpress

> ExpressJS server to show your RevealJS presentation and add interaction with your audience

## What is RevealExpress

Start revealexpress inside your presentation folder, share the URL with your audience and start your interactive presentation.

## Instructions

#### 1 - Install RevealExpress globally

You must have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.org) already installed.
In your console, run:

<sup>(You may need to add `sudo` at start)</sup>

```
npm install -g revealexpress
```


#### 2 - Launch RevealExpress inside your presentation folder

In your console, navigate to your project folder.
Then launch RevealExpress:

```
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

### Additional features
#### PrismJS
You can include [PrismJS](https://prismjs.com) in your slideshow using Webpack and [babel-plugin-prismjs](https://www.npmjs.com/package/babel-plugin-prismjs).
 

## Credits

##### Development

- Pierre Jehan ([GitHub](https://github.com/pjehan), [Site](https://www.pierre-jehan.com))

This project was inspired by the [Keppler](https://github.com/brunosimon/keppler) project.
