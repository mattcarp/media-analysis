var express = require('express');
var router = express.Router();
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var binary = require('binary');
var bodyParser = require('body-parser');
var stream = require('stream');
var randomstring = require("randomstring");

var result;


router.post('/', function (req, res, next) {
  'use strict';

  var bufferStream = new stream.PassThrough();
  bufferStream.end(req.body);

  console.log("content type:");
  console.log(req.headers['content-type']);

  console.log("req.body and length:");
  console.log(req.body);
  console.log(req.body.length);
  
  var tempName = "/tmp/" + randomstring.generate(12);
  console.log("the temp name:");
  console.log(tempName);

  fs.writeFile(tempName, req.body, function (err) {
    if (err) {
      return console.log(err);
    }
    
    // TODOmc make file name variable
    ffmpeg.ffprobe(tempName, function(err, metadata) {
      console.log("attempt to process bufferstream:");
      result = require('util').inspect(metadata, false, null);
      console.log("behold:")
      console.log(result);
      res.json(result);
      // res.send();
    });
    
    console.log("The file was saved!");
  }); // writeFile
console.log("SECOND RESULT")
console.log(result)
  // res.send(result);
});

module.exports = router;