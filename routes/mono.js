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
    console.log("you hit the mono detection endpoint with a POST");
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

        console.log("call ffprobe with exec:");
        child = exec(`ffprobe -of json -show_streams -v error -show_format ${tempName}`,
            function( error, stdout, stderr ) {
                var result = {}
                console.log("STDOUT: " + stdout );
                console.log("STDERR: " + stderr );
                if ( error !== null ) {
                  console.log("here is the exec error from ffprobe: " + error );
                }
                result.error = stderr;
                result.analysis = stdout;
                res.json(result);
            } );

        console.log("the temp file was saved");
    } ); // writeFile
} );

module.exports = router;
