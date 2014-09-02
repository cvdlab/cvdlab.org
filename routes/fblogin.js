var mws = require('./mws.js');
var express = require('express');
var app = module.exports = express();

var root = '/auth';


// ogni mese andrebbe aggiornata l'immagine profilo con un cron che richiede per ogni alumnus la nuova location dell'immagine.
app.post(root + '/fblogin', [
  mws.data,
  mws.find_alumnus,
  mws.check_alumnus,
  mws.get_fb_user,
  mws.get_picture,
  mws.get_groups,
  mws.check_membership,
  mws.create_alumnus
]);





