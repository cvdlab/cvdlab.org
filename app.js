var mongojs = require('mongojs');
var db = mongojs('cvdlaborg', ['alumni']);

var util = require('util');
function inspect (o) {
  console.log(util.inspect(o, { showHidden: true, depth: null }));
}

// cvdlab - Test 1
// const FB_APP_ID = '1460272620917555';
// const FB_APP_SECRET = '34ca9c8e819a3471e68f759851857c6e';
const FB_APP_ID = '1425724317705719'
const FB_APP_SECRET = '07e8fb0348011714caf06a5a0cfa1506';
var graph = require('fbgraph');
var options = {
  timeout:  3000,
  pool:     { maxSockets:  Infinity },
  headers:  { connection:  "keep-alive" }
};
graph.setOptions(options);
graph.setAppSecret(FB_APP_SECRET);

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
app.use(bodyParser());
app.use(methodOverride());
app.use(require('./routes/alumni.js'));
app.use(require('./routes/fblogin.js'));

app.use('*', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(PORT, function () {
  console.log('Server is listening on ' + PORT);
});
