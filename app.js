
var PORT = 9011;
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var favicon = require('serve-favicon');
var express = require('express');
var app = express();

app.enable('trust proxy');

app.use(logger('dev'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(methodOverride());
app.use(function (err, req, res, next) {
  // logic
});
app.use(require('./routes/alumni.js'));
app.use(require('./routes/alumni.picture.js'));

app.listen(PORT, function () {
  console.log('Server is listening on ' + PORT);
});
