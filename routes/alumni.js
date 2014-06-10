var express = require('express');
var app = module.exports = express();

var mongojs = require('mongojs');
var db = mongojs('cvdlaborg', ['alumni']);

app.get('/alumni', function (req, res) {
  var id = req.params.id;
  var year = req.query.year;
  var query = {};
  
  if (year) {
    query.year = year;
  }
  
  db.alumni.find(query, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    res.send(alumnus);
  });
});

app.get('/alumni/:id', function (req, res) {
  var id = req.params.id;
  
  db.alumni.find({_id: id}, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    res.send(alumnus);
  });
});

app.post('/alumni/:id', function (req, res) {
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
      gihub_user: body.github_user || alumnus.github_user,
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
