var express    = require('express');
var app        = express();
var path       = require('path');
var fs         = require('fs');
var bodyParser = require('body-parser');
var favicon    = require('serve-favicon');

// quickly route address
var index     = require('./routes/index');
var users     = require('./routes/users');
var templates = require('./routes/templates');
var favicon   = require('serve-favicon');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname + "/")));
app.use(favicon(path.join(__dirname, 'images/favicon', 'goodstudio.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', index);
app.use('/users', users);
app.use('/templates', templates);

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

// port 8082 setting. if you change port, change port num.
app.listen(8082, function () {
    console.log('NodeJs Server START on port 8082!');
});

//module.exports = app;
