// var mongojs = require('mongojs');
// var db = mongojs('cvdlaborg', ['alumni']);

var util = require('util');
function inspect (o) {
  console.log(util.inspect(o, { showHidden: true, depth: null }));
}

const PORT = 9011;
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(require('./routes/alumni.js'));
app.use(require('./routes/fblogin.js'));

app.use('*', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, function () {
  console.log('Server is listening on ' + PORT);
});
