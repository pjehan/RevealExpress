var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var os = require('os');
var yargs = require('yargs');
var { hideBin } = require('yargs/helpers');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: { origin: true } // WebSocket server listens on a different port than the slideshow
});

// Return the first external IPv4 address of this machine
function getIpAddress() {
    for (const addresses of Object.values(os.networkInterfaces())) {
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return '127.0.0.1';
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// socketio
io.on('connection', function (socket) {
    console.log('a user connected');
    console.log(socket.handshake.address);
    socket.on('slidechanged', (current_slide) => socket.broadcast.emit('slidechanged', current_slide));
    socket.on('quizsubmitted', (data) => socket.broadcast.emit('quizsubmitted', data));
});

// Convert "true" and "false" strings from command line (e.g. --revealjs.controls=false) to booleans
function parseBooleans(value) {
    if (value === 'true' || value === 'false') {
        return value === 'true';
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, parseBooleans(val)]));
    }
    return value;
}

// Command line arguments override slideshow.config.js, which overrides default values
function parseArgs(fileConfig) {
    return yargs(hideBin(process.argv))
        .config(fileConfig)
        .option('name', {
            alias: 'n',
            describe: 'Slideshow name',
            default: 'RevealExpress',
            type: 'string'
        })
        .option('port', {
          alias: 'p',
          describe: 'Slideshow port',
          default: 3000,
          type: 'number'
        })
        .option('portws', {
          alias: 'pws',
          describe: 'Slideshow WebSocket port',
          default: 3001,
          type: 'number'
        })
        .option('password', {
          describe: 'Presenter password',
          default: null,
          type: 'string'
        })
        .option('revealjs', {
          describe: 'RevealJS parameters',
          default: {},
          type: 'object',
          coerce: parseBooleans
        })
        .option('path', {
            describe: 'Folder path',
            default: process.cwd(),
            type: 'string'
        })
        .option('assetspath', {
            describe: 'Assets path',
            default: '/assets',
            type: 'string'
        })
        .option('stylesheets', {
            alias: 'css',
            describe: 'Stylesheets',
            default: [],
            type: 'array'
        })
        .option('javascripts', {
            alias: 'js',
            describe: 'JavaScripts',
            default: [],
            type: 'array'
        })
        .parseSync();
}

// The folder path is needed to find slideshow.config.js
const configPath = path.join(parseArgs({}).path, 'slideshow.config.js');
const args = parseArgs(fs.existsSync(configPath) ? require(configPath) : {});

const config = {
    name: args.name,
    port: args.port,
    portws: args.portws,
    password: args.password,
    revealjs: args.revealjs,
    path: args.path,
    assetspath: args.assetspath,
    stylesheets: args.stylesheets,
    javascripts: args.javascripts
};

process.env.PORT = config.port;
import('open').then(({ default: open }) => open(`http://${getIpAddress()}:${config.port}`)); // Open app in default web browser
http.listen(config.portws, getIpAddress()); // Start WebSocket server

console.log(config);

// add presentation assets to static files
const assetsPath = path.join(config.path, config.assetspath);
if(fs.existsSync(assetsPath)) {
    app.use(config.assetspath, express.static(assetsPath))
} else {
    console.log('Assets directory ' + assetsPath + ' does not exists!')
}

router.get('/', function (req, res, next) {
    res.render('index', {
        title: config.name,
        stylesheets: config.stylesheets,
        javascripts: config.javascripts
    });
});

router.get('/chapters', (req, res, next) => {
    let chapters = [];

    fs.readdir(config.path, (err, files) => {
      files.forEach(file => {
        if (path.extname(file) === '.html') {
          let filepath = path.join(config.path, file);
          chapters.push(fs.readFileSync(filepath, 'utf-8'));
        }
      });
      res.json(chapters);
    });

});

// Only expose what the client needs (never the password)
router.get('/config', (req, res) => res.json({
    name: config.name,
    port: config.port,
    portws: config.portws,
    revealjs: config.revealjs
}));

router.get('/check-password/:password', (req, res) => {
  return res.json({ valid: config.password && req.params.password === config.password });
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
