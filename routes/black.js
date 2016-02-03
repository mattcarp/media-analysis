var express = require('express');
var router = express.Router();

/* post file slice for black detection. */
// router.post('/', function(req, res, next) {
//   res.send('whe should perform black detection at this point');
// });

module.exports = router;
var express = require( 'express' );
var router = express.Router();
var ffmpeg = require( 'fluent-ffmpeg' );
var fs = require( 'fs' );
var binary = require( 'binary' );
var bodyParser = require('body-parser');
var stream = require( 'stream' );
var randomstring = require("randomstring");
var exec = require( 'child_process' ).exec,
    child;
var result;

router.post('/', function(req, res, next) {
    "use strict";

    var bufferStream = new stream.PassThrough();
    bufferStream.end(req.body);
    console.log("you hit the black detection endpoint with a POST");
    console.log("content type:");
    console.log(req.headers['content-type']);

    console.log("req.body and length:");
    console.log(req.body);
    console.log(req.body.length);

    var tempName = "/tmp/" + randomstring.generate(12);
    console.log("the temp name:");
    console.log(tempName);

    fs.writeFile( tempName, req.body, function( err ) {
        if ( err ) {
            return console.log( err );
        }

        console.log("call ffprobe black detection:");
        let ffprobeCmd = `ffprobe -f lavfi -i "movie=${tempName},blackdetect[out0]"` +
        ` -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet`

        child = exec(ffprobeCmd,
            function(error, stdout, stderr) {

                let result = {}
                console.log("STDOUT: " + stdout );
                console.log("STDERR: " + stderr );
                if ( error !== null ) {
                  console.log("here is the exec error from ffprobe: " + error );
                }
                // TODOmc filter empty elements
                let analysisArr = stdout.split("\n").filter(item => item !== "");
                console.log("my analysisArr");
                console.log(analysisArr);

                let blackObjs = analysisArr.map(item => {
                  let temp = {};
                  if (item.indexOf("black_start") > -1) {
                    temp.tag = "blackStart";
                  }
                  if (item.indexOf("black_end") > -1 ) {
                    temp.tag = "blackEnd";
                  }
                  temp.value = item.substr(item.indexOf("=") + 1);
                  return temp;
                });
                // TODOmc take blackObjs array and transfomr to 'blackIntervals'
                // arr, with start, end, and duration
                console.log("my black objs:");
                console.log(blackObjs);
                result.error = stderr;
                result.blackDetect = blackObjs;
                res.json(result);
            } );

        console.log("the temp file was saved");
    } ); // writeFile
} );

module.exports = router;
