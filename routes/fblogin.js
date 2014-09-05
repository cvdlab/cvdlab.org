var mws = require('./mws.js');
var express = require('express');
var app = module.exports = express();

var root = '/auth';

mws.get_group_members = function (req, res, next) {
  var access_token = req.body.access_token;
  var tokenized = '/329084563858662/members?limit=500&access_token=' + access_token;
  graph.get(tokenized, function (err, res) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while getting group members from Facebook. Please Try again.'
      });
      return;
    }
    req.mwsdata.members = res.data;
    next();
  });
};

mws.check_group_member = function (req, res, next) {
  var user_id = req.mwsdata.fb_user.id;
  var is_member = req.mwsdata.members.some(function (member) {
    return member.id === user_id;
  });
  if (!is_member) {
    res.send({
      ok: false,
      message: 'You are not memeber of cvdlab group. If worth, apply for membership: https://www.facebook.com/groups/cvdlab/'
    });
    return;
  }
  next();
};

// ogni mese andrebbe aggiornata l'immagine profilo con un cron che richiede per ogni alumnus la nuova location dell'immagine.
app.post(root + '/fblogin', [
  mws.data,
  mws.find_alumnus,
  mws.check_alumnus,
  mws.get_fb_user,
  mws.get_picture,
  // mws.get_groups,
  // mws.check_membership,
  mws.get_group_members,
  mws.check_group_member,
  mws.create_alumnus
]);





