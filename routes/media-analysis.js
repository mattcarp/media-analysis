// eslint-disable-next-line strict
const express = require('express');
const router = express.Router();
const fs = require('fs');
const stream = require('stream');
const randomstring = require('randomstring');
const exec = require('child_process').exec;

router.post('/', function (req, res) {
  let bufferStream = new stream.PassThrough();
  bufferStream.end(req.body);

  console.log('content type:');
  console.log(req.headers['content-type']);

  console.log('req.body and length:');
  console.log(req.body);
  console.log(req.body.length);

  let tempName = '/tmp/' + randomstring.generate(12);
  console.log('the temp name:');
  console.log(tempName);

  fs.writeFile(tempName, req.body, function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('call ffprobe with exec:');
    child = exec(`ffprobe -of json -show_streams -v error -show_format ${tempName}`,

      function (error, stdout, stderr) {
        let result = {};
        console.log('STDOUT: ', stdout);
        console.log('STDERR: ', stderr);
        if (error !== null) {
          console.log('here is the exec error from ffprobe:', error);
        }
        result.error = stderr;
        result.analysis = stdout;
        res.json(result);
      });

    console.log('the temp file was saved');
  });
});

module.exports = router;
