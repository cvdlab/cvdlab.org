var mongojs = require('mongojs');
var db = mongojs('cvdlab', ['alumni']);

var util = require('util');
function inspect (o) {
  console.log(util.inspect(o, { showHidden: true, depth: null }));
}

const PORT = 3000;
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var favicon = require('serve-favicon');
var express = require('express');
var app = express();

app.enable('trust proxy');

app.use(logger('dev'));
// app.use(favicon(__dirname + '/../client/favicon.ico'));
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(require('server/api/alumni.js'));
app.use(require('server/api/fblogin.js'));

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.listen(PORT, function () {
  console.log('Server is listening on ' + PORT);
});
