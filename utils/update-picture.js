require('dotenv').load({path: '../.env'});
var env = process.env;
var FB_APP_ID = env.FB_APP_ID;
var FB_APP_SECRET = env.FB_APP_SECRET;
var MONGO_USER = env.MONGO_USER;
var MONGO_PASS = env.MONGO_PASS;

var mongojs = require('mongojs');
var db = mongojs(MONGO_USER + ':' + MONGO_PASS + '@localhost:27017/cvdlaborg', ['alumni']);
var request = require('request');
var async = require('async');
var util = require('util');
// var curry = require('curry');

var graph = require('fbgraph');
var options = {
  timeout:  3000,
  pool:     { maxSockets:  Infinity },
  headers:  { connection:  "keep-alive" }
};
graph.setOptions(options);
graph.setAppSecret(FB_APP_SECRET);

var WIDTH = 200;
var HEIGHT = 200;

var get_alumnus = function (alumnus_id) {
  // logging
  console.log('- updating picture for alumnus ', alumnus_id);
  return function (done) {
    db.alumni.findOne({_id: alumnus_id}, {_id: 1, picture: 1}, done);
  };
};

var get_picture = function (alumnus, done) {
  if (alumnus === null) {
    console.log('* Found null alumnus');
    setImmediate(done, null);
    return;
  }

  var data = { alumnus: alumnus };
  // https://graph.facebook.com/10152709785324445/picture?width=200&height=200&type=square&access_token=1425724317705719|07e8fb0348011714caf06a5a0cfa1506
  var user_id = alumnus._id;
  var tokenized = util.format('/%s/picture?width=%s&height=%s&type=square&access_token=%s|%s', user_id, WIDTH, HEIGHT, FB_APP_ID, FB_APP_SECRET);
  graph.get(tokenized, function (err, res) {
    if (res.image = true) {
      data.picture = res.location;
    }

    setImmediate(done, err, data);
  });
};

var update_alumnus = function (data, done) {
  if (!data.picture) {
    setImmediate(done);
    return;
  }

  db.alumni.update({_id: data.alumnus._id}, {$set: { picture: data.picture }}, done);
};


var iterator = function (alumnus, next) {
  if (alumnus === null) {
    console.log('* Found a `null` alumnus');
    setImmediate(next);
    return;
  }

  async.waterfall([
    get_alumnus(alumnus._id),
    get_picture,
    update_alumnus
  ], next);

};

var end = function (err) {
  if (err) {
    console.error('An error occurred', err);
    process.exit(2);
  }

  console.log('\n\n\tDONE :)\n\n');
  process.exit(0);
};

// main

db.alumni.find({}, {_id: 1}, function (err, alumni) {
  if (err) {
    console.error('An error occurred during alumni ids retrival', err);
    process.exit(1);
  }
  async.eachSeries(alumni, iterator, end);
});


/*****

TODO:

remove curry from node_modules
remove curry from pakage.json



***/
