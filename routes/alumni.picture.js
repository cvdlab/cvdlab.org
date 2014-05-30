
var fs = require('fs');
var multiparty = require('multiparty');
var gm = require('gm');
var express = require('express');
var app = module.exports = express();

var mongojs = require('mongojs');
var db = mongojs('cvdlab.org', ['alumni']);

var side = 200;

app.post('/alumni/:id/picture', function (req, res) {
  var id = req.params.id;
  var dirpath = './public/images/' + id;
  var filepath =  dirpath + '/thumb.jpg';
  var form = new multiparty.Form();

  form.on('part', function(part) {
    if (!part.filename) {
      console.log('ERROR: filename not given');
    }
    
    form.removeListener('close', onEnd);
    
    gm(part, part.filename).size({bufferStream: true}, function(err, size) {
      var gm = this;
      if (err) {
        console.log(err);
        console.log('ERROR: can\'t resize file on disk');
        return;
      }

      // if (size.width < side && size.height < side) {
      //   res.send('not resized');
      //   return;
      // }

      gm.resize(side, side);
      gm.compress('jpeg');
      gm.quality(80);
      
      fs.mkdir(dirpath, function (err) {
        if (err) {
          console.log(err);
          console.log('ERROR: can\'t create directory on disk');
        }
        
        gm.write(filepath, function (err) {
          if (err) {
            console.log(err);
            console.log('ERROR: can\'t write file on disk');
          }
        
          res.send('ok');
        });  
      });
      
      
    });
  });

  function onEnd() {
    throw new Error("no uploaded file");
  }

  form.on('close', onEnd);
  form.parse(req);
});