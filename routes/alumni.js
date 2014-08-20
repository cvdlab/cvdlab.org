var express = require('express');
var app = module.exports = express();

var mongojs = require('mongojs');
var db = mongojs('cvdlaborg', ['alumni']);

var root = '/api/v0/';

app.get(root + 'alumni', function (req, res) {
  var id = req.params.id;
  var year = req.query.year;
  var query = {};
  
  if (year) {
    query.year = year;
  }

  // res.send(alumni);
  // return;
  
  db.alumni.find(query, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    res.send(alumnus);
  });
});

app.get(root + 'alumni/:id', function (req, res) {
  var id = req.params.id;
  
  db.alumni.findOne({_id: id}, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    res.send(alumnus);
  });
});

app.post(root + 'alumni/:id', function (req, res) {
  var id = req.params.id;
  var body = req.body;
  
  db.alumni.find({_id: id}, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    alumnus = alumnus || {};
    
    var new_alumnus = {
      full_name: body.full_name || alumnus.full_name,
      email: body.email || alumnus.email,
      website: body.website || alumnus.website,
      github_username: body.github_username || alumnus.github_username,
      year: body.year || alumnus.year,
      has_picture: alumnus.has_picture || body.has_picture || false
    };
  
    db.alumni.update({_id: id}, {$set: new_alumnus}, {upsert: true}, function (err) {
      if (err) {
        res.status(500).send(err);
        return;
      }
    
      res.send('ok');
    });
  });
});
