var mws = require('./mws.js');
var express = require('express');
var app = module.exports = express();

var root = '/api/';

app.post(root + 'ping', mws.create_ping);
