var mws = require('./mws.js');
var express = require('express');
var app = module.exports = express();

var root = '/api/';

app.get(root + 'alumni', mws.retrieve_alumni);

app.get(root + 'alumni/:id', mws.retrieve_alumnus);

app.post(root + 'alumni/:id', mws.post_alumnus);
