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
http.listen(3001, ip.address());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

opn(`http://${ip.address()}:3000`);

// socketio
io.on('connection', function (socket) {
    console.log('a user connected');
    console.log(socket.handshake.address);
    socket.on('slidechanged', (current_slide) => socket.broadcast.emit('slidechanged', current_slide));
    socket.on('quizsubmitted', (data) => socket.broadcast.emit('quizsubmitted', data));
});

const config = {};

const args = yargs
    .option('path', {
        describe: 'Folder path',
        default: process.cwd(),
        type: 'string'
    })
    .option('name', {
        alias: 'n',
        describe: 'Slideshow name',
        default: 'RevealExpress',
        type: 'string'
    })
    .argv;

config.path = args.path;
config.name = args.name;

router.get('/', function (req, res, next) {
    res.render('index', {title: config.name});
});

router.get('/chapters', (req, res, next) => {
    var chapters = [];

    fs.readdirSync(config.path).forEach(file => {
        if (path.extname(file) === '.html') {
            var filepath = path.join(config.path, file);
            chapters.push(fs.readFileSync(filepath, 'utf-8'));
        }
    });

    res.json(chapters);
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
