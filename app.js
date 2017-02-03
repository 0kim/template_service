var express    = require('express');
var path       = require('path');
var fs         = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var favicon    = require('serve-favicon');

var routeIndex = require('./routes/index');
var routeUsers = require('./routes/users');
var routeTemplates = require('./routes/templates');
var routeEvernote = require('./routes/evernote');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals._ = require("underscore");

app.use(express.static(path.join(__dirname + "/")));
app.use(favicon(path.join(__dirname, 'images/favicon', 'goodstudio.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
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

// templete loading
app.post('/templete', function (req, res) {
  console.log("success");
});

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

module.exports = app;
