var mongojs = require('mongojs');
var db = mongojs('cvdlaborg', ['alumni']);

/**
 * Expose middlewares
 *
 */

var mws = module.exports = {};

/**
 * mws.data
 * @middleware
 */

var mwsdata = mws.data = function (req, res, next) {
  req.mwsdata = req.mwsdata || {};
  next();
};

/**
 * mws.find_alumnus
 * @middleware
 */

var find_alumnus = mws.find_alumnus = function (req, res, next) {
  var user_id = req.body.user_id;
  db.alumni.findOne({_id: user_id}, function (err, alumnus) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while reqtrieving alumnus info from DB. Please Try again.'
      });
      return;
    }

    req.mwsdata.alumnus = alumnus;
    next();
  });
};

/**
 * check_alumnus
 * @middleware
 */

var check_alumnus = mws.check_alumnus = function (req, res, next) {
  var alumnus = req.mwsdata.alumnus;
  if (alumnus) {
    res.send({
      ok: true,
      alumnus: alumnus
    });
  } else {
    next();
  }
};

/**
 * get_fb_user
 * @middleware
 */

var get_fb_user = mws.get_fb_user = function (req, res, next) {
  var access_token = req.body.access_token;
  var tokenized = '/me?access_token=' + access_token;
  graph.get(tokenized, function (err, res) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while getting user info from Facebook. Please Try again.'
      });
      return;
    }

    req.mwsdata.fb_user = res;
    next();
  });
};

/**
 * get_picture
 * @middleware
 */

const WIDTH = 200;
const HEIGHT = 200;
var get_picture = mws.get_picture = function (req, res, next) {
  var access_token = req.body.access_token;
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
      req.mwsdata.fb_user.picture = res.location;
    }

    next();
  });
};

/**
 * get_groups
 * @middleware
 */

var get_groups = mws.get_groups = function (req, res, next) {
  var groups = [];
  var access_token = req.body.access_token;
  var tokenized = '/me/groups?access_token=' + access_token;
  graph.get(tokenized, function (err, res) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while getting user groups from Facebook. Please Try again.'
      });
      return;
    }

    var follow_pagination = function (result) {
      // add groups
      Array.prototype.push.apply(groups, result.data);
      // follow pagination
      if (result.paging && result.paging.next) {
        graph.get(result.paging.next, function (err, again) {
          if (err) {
            console.log(err);
            res.send({
              error: true,
              message: 'An error has occurred while getting user groups from Facebook. Please Try again.'
            });
            return;
          }

          follow_pagination(again);
        });
      } else {
        req.mwsdata.fb_groups = groups;
        next();
      };
    }

    follow_pagination(res);
  });
};

/**
 * check_membership
 * @middleware
 */

var check_membership = mws.check_membership = function (req, res, next) {
  var groups = req.mwsdata.fb_groups;
  var is_member = groups.filter(function (group) {
    return group.name === 'cvdlab' && group.id === '329084563858662';
  }).length > 0;

  if (is_member) {
    next();
  } else {
    res.send({
      ok: false,
      message: 'You are not memeber of cvdlab group. If worth, apply for membership: https://www.facebook.com/groups/cvdlab/'
    })
    return;
  }
};

/**
 * create_alumnus
 * @middleware
 */

var create_alumnus = mws.create_alumnus = function (req, res) {
  var alumnus = req.mwsdata.fb_user;
  alumnus._id = alumnus.id;
  delete alumnus.id;
  db.alumni.insert(alumnus, function (err) {
    if (err) {
      console.log(err);
      res.send({
        error: true,
        message: 'An error has occurred while saving alumnus into DB. Please Try again.'
      });
      return;
    }
  });

  res.send({
    ok: true,
    alumnus: alumnus
  });
};

/**
 * retrieve_alumni
 * @middleware
 */

var retrieve_alumni = mws.retrieve_alumni = function (req, res) {
  var id = req.params.id;
  var year = +req.query.year;
  var query = {};

  if (year !== undefined) {
    query.year = year;
  }

  db.alumni.find(query, function (err, alumni) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.send(alumni);
  });
};

/**
 * retrieve_alumnus
 * @middleware
 */

var retrieve_alumnus = mws.retrieve_alumnus = function (req, res) {
  var id = req.params.id;

  db.alumni.findOne({_id: id}, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.send(alumnus);
  });
};

/**
 * post_alumnus
 * @middleware
 */

var post_alumnus = mws.post_alumnus = function (req, res) {
  var id = req.params.id;
  var body = req.body;

  db.alumni.find({_id: id}, function (err, alumnus) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    alumnus = alumnus || {};

    var new_alumnus = {
      first_name: body.first_name || alumnus.first_name,
      last_name: body.last_name || alumnus_last_name,
      email: body.email || alumnus.email,
      website: body.website || alumnus.website,
      github_username: body.github_username || alumnus.github_username,
      year: +body.year || alumnus.year,
      has_picture: alumnus.has_picture || body.has_picture || false
    };

    console.log(new_alumnus);

    db.alumni.update({_id: id}, {$set: new_alumnus}, {upsert: true}, function (err) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.send(new_alumnus);
    });
  });
};

