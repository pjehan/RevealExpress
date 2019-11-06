var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var opn = require('opn');
var ip = require("ip");
var yargs = require('yargs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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

let config = {};

const args = yargs
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
      type: 'int'
    })
    .option('portws', {
      alias: 'pws',
      describe: 'Slideshow WebSocket port',
      default: 3001,
      type: 'int'
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
    .argv;

config.name = args.name;
config.port = args.port;
config.portws = args.portws;
config.path = args.path;
config.assetspath = args.assetspath;
config.stylesheets = args.stylesheets;
config.javascripts = args.javascripts;

process.env.PORT = config.port;
opn(`http://${ip.address()}:${config.port}`); // Open app in default web browser
http.listen(config.portws, ip.address()); // Start WebSocket server

// load config file
const configPath = path.join(config.path, 'slideshow.config.js');
if(fs.existsSync(configPath)) {
    config = Object.assign(config, require(configPath))
}

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

router.get('/config', (req, res) => res.json(config));

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
