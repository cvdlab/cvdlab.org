var mongojs = require('mongojs');
var db = mongojs('cvdlaborg', ['alumni']);
var request = require('request');
var async = request('async');
var curry = require('curry');

require('dotenv').load();
var FB_APP_ID = process.env.FB_APP_ID;
var FB_APP_SECRET = process.env.FB_APP_SECRET;
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

var get_alumnus = function (id) {
  // logging
  console.log('- updating picture for alumnus ', id);
  return curry(db.alumni.findOne)({_id: id}, {picture: 1});
};

var head_picture = function (alumnus, done) {
  request.head(alumnus.picture, function (err, response) {
    setImmediate(done, null, {
      alumnus: alumnus,
      statusCode: response.statusCode
    });
  });
};

var if_get_picture = function (data, done) {
  if (data.statusCode === 200) {
    setImmediate(done);
    return;
  }

  var tokenized = util.format('me/picture?width=%s&height=%s&type=square&access_token=%s', WIDTH, HEIGHT, access_token);
  graph.get(tokenized, function (err, res) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while getting user picture from Facebook. Please Try again.'
      });
      return;
    }

    if (res.image = true) {
      data.picture = res.location;
    }

    setImmediate(done, null, data);
};

var if_update_alumnus = function (data, done) {
  if (!data.picture) {
    setImmediate(done);
    // logging
    console.log('- DONE updating picture for alumnus ', data.alumnus._id);
    return;
  }

  setImmediate(done);
};

db.alumni.find({}, {_id: 1}).forEach(function (err, alumnus) {
  if (err) {
    console.error('Error occurred');
    process.exit(1);
  }

  async.waterfall([
    get_alumnus(alumnus._id),
    head_picture,
    if_get_picture
    if_update_alumnus
  ], function (err, result) {
    if (err) {
      console.error('An error occurred', err);
      process.exit(2);
    }

    console.log('\n\n\tDONE :)\n\n');
    process.exit(0);
  });



});
