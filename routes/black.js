/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = express.Router();
const fs = require("fs");
const prependFile = require("prepend-file");
const exec = require("child_process").exec;

module.exports = router;

function processBlack(fileToProcess, callback) {
  const ffprobeCmd = `ffprobe -f lavfi -i "movie=${fileToProcess},blackdetect[out0]"` +
    ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;
  console.log("call ffprobe black detection:");
  exec(ffprobeCmd,
    (error, stdout, stderr) => {
      const result = {};
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      if (error !== null) {
        console.log("here is the exec error from ffprobe: ", error);
      }
      // becuase we're sending slices, the info will be within stderr
      // TODO is the above true even if we force the format?
      const analysisArr = stderr.split("\n");
      const blackIntervals = analysisArr.filter(item => {
        return item.indexOf("black_duration") > -1;
      });

      const blackObjs = blackIntervals.map(item => {
        return {
          tempFile: fileToProcess,
          start: item.substring(item.lastIndexOf("start:") + 6,
            item.indexOf("black_end") - 1),
          end: item.substring(item.lastIndexOf("end:") + 4,
            item.indexOf("black_duration") - 1),
          duration: item.substr(item.indexOf("black_duration:") + 15),
        };
      });
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
    prependFile(fileToConcat, req.body, err => {
      if (err) {
        console.log("error while prepending", err);
      }
      console.log("hopefully, we just prepended", fileToConcat,
        "which now has these stats:");
      fs.stat(fileToConcat, (err2, stats) => {
        console.log(stats);
      });
      processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    }); // fs.append
  }
}); // router.post


module.exports = router;
