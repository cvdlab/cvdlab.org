
var PORT = 9011;
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var express = require('express');
var app = express();

app.enable('trust proxy');

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(methodOverride());
app.use(function (err, req, res, next) {
  // logic
});



app.listen(PORT, function () {
  console.log('Server is listening on ' + PORT);
});
