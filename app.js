var config     = require('./config.json');
var express    = require('express');
var path       = require('path');
var fs         = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var favicon    = require('serve-favicon');
var morgan = require('morgan');
var winston = require('winston');
require('winston-daily-rotate-file');

var routeIndex = require('./routes/index');
var routeUsers = require('./routes/users');
var routeTemplates = require('./routes/templates');
var routeEvernote = require('./routes/evernote');

var app = express();

// Logging
logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var transport_drf = new winston.transports.DailyRotateFile( {
    filename: path.join(logDirectory, '.log'),
    datePattern: 'yyyy-MM-dd',
    localtime: true,
    prepend: true,
    level: process.env.ENV === 'development' ? 'debug' : 'info'
});

var transport_console =  new winston.transports.Console({
    handleExceptions: true,
    json: false,
    colorize: true,
    level: process.env.ENV === 'development' ? 'debug' : 'info',
});

var logger = new (winston.Logger) ({
    transports: [
      transport_drf,
      transport_console
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(JSON.parse(message));
    }
};

app.use(morgan(
    '{"remote_addr": ":remote-addr", ' +
     '"remote_user": ":remote-user", ' +
    '"date": ":date[clf]", ' +
    '"method": ":method", ' +
    '"url": ":url", ' +
    '"http_version": ":http-version", ' +
    '"status": ":status", ' +
    '"result_length": ":res[content-length]", ' +
    '"referrer": ":referrer", ' +
    '"user_agent": ":user-agent", ' +
    '"response_time": ":response-time"}', {stream: logger.stream}));
logger.info("logger is ready");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals._ = require("underscore");

app.use(express.static(path.join(__dirname + "/")));
app.use(favicon(path.join(__dirname, 'images/favicon', 'goodstudio.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.EXP_COOKIE_KEY));
app.use(express.static(path.join(__dirname, 'public')));

// express.session
app.use(expressSession({
    secret: 'temporary_secret',
    resave: false,
    saveUninitialized: true
}));

app.use('/', routeIndex);
app.use('/users', routeUsers );
app.use('/templates', routeTemplates);
app.use('/en', routeEvernote);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.post('/template', function (req, res) {

  var subject = req.body.subject;
  var url     = req.body.url;
  var enexUrl = req.body.enexUrl;

  console.log("subject : " + subject);
  console.log("url     : " + url);
  console.log("enexUrl : " + enexUrl);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

logger.info("Application is ready to serve");

module.exports = app;
