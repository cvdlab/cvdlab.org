var update_pictures = require('./update-pictures.js');
var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '00 00 01 * * *',
  onTick: update_pictures,
  start: false
});

/** export **/
module.exports = job;
