/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = new express.Router();
const fs = require("fs");
const prependFile = require("prepend-file");
const exec = require("child_process").exec;
var blackObjs = {};
var blackString;
var blackInStdOut;

module.exports = router;

function processBlack(fileToProcess, callback) {
  const ffprobeCmd = `ffprobe -f lavfi -i "movie=${fileToProcess},blackdetect[out0]"` +
    ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;

  // const ffprobeCmd2 = `ffprobe -f lavfi -i "-f prores movie=${fileToProcess},blackdetect[out0]"` +
  //   ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;
  console.log(":");
  console.log(fileToProcess);
  console.log("call ffprobe black detection:");
  exec(ffprobeCmd,
    (error, stdout, stderr) => {
      const result = {};
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      if (error !== null) {
        console.log("here is the exec error from ffprobe: ", error);
      }

      // TODO black can be in either stdout or stderr
      if (stdout.indexOf("black_end") > -1) {
        blackInStdOut = true;
        blackString = stdout;
      } else {
        blackInStdOut = false;
        blackString = stderr;
      }
      const analysisArr = blackString.split("\n");

      console.log("black analysis array:");
      console.log(analysisArr);


      if (!blackInStdOut) {
        const blackIntervals = analysisArr.filter(item => {
          return item.indexOf("black_start") > -1;
        });
        console.log("these are my black intervals:");
        console.log(blackIntervals);
        blackObjs = blackIntervals.map(item => {
          return {
            tempFile: fileToProcess,
            start: item.substring(item.lastIndexOf("start:") + 6,
              item.indexOf("black_end") - 1),
            end: item.substring(item.lastIndexOf("end:") + 4,
              item.indexOf("black_duration") - 1),
            duration: item.substr(item.indexOf("black_duration:") + 15),
          };
        });
      }
      if (blackInStdOut) {
        blackObjs = blackIntervals.map(item => {
          return {
            tempFile: fileToProcess,
            start: item.substring(item.lastIndexOf("start=") + 6),
            end: item.substring(item.lastIndexOf("end=") + 4),
            // TODO stdout doesn't give duration: need to calculate it
            // duration: item.substr(item.indexOf("black_duration:") + 15),
          };
        });
      }

      console.log("and me black objs:");
      console.log(blackObjs);
      result.error = stderr;
      result.blackDetect = blackObjs;
      callback(result);
    }); // exec
}

router.post("/", (req, res) => {
  const headers = req.headers;
  const prefix = "/tmp/";
  const fileToConcat = prefix + headers["xa-file-to-concat"];
  const position = headers["xa-black-position"];
  console.log("me headers are");
  console.log(headers);
  console.log("position", position);

  // const bufferStream = new stream.PassThrough();
  // bufferStream.end(req.body);
  console.log("black req.body and length:");
  console.log(req.body);
  console.log(req.body.length);

  if (position === "head") {
    fs.appendFile(fileToConcat, req.body, err => {
      if (err) {
        console.log("error while appending", err);
      }
      console.log("hopefully, we just appended", fileToConcat,
        "which now has these stats:");
      fs.stat(fileToConcat, (err2, stats) => {
        console.log(stats);
      });
      processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    }); // fs.append
  }


  if (position === "tail") {
    // var processedBytes;
    prependFile(fileToConcat, req.body, "binary", err => {
      if (err) {
        console.log("error while prepending", err);
      }
      // success
      console.log("hopefully, we just prepended", fileToConcat,
        "which now has these stats:");
      fs.stat(fileToConcat, (err2, stats) => {
        console.log(stats.size);
      });
      processBlack(fileToConcat, (result) => {
        // result.processedBytes = processedBytes;
        res.json(result);
      });
    }); // prependFile
  }
}); // router.post


module.exports = router;
