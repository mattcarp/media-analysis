/* eslint no-console: 0 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const stream = require("stream");
const exec = require("child_process").exec;
// const child;
// let result;

module.exports = router;

router.post("/", (req, res) => {
  const randomstring = require("randomstring").generate(12);
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.body);
  console.log("you hit the black detection endpoint with a POST");
  console.log("content type:");
  console.log(req.headers["content-type"]);

  console.log("req.body and length:");
  console.log(req.body);
  console.log(req.body.length);
  const prefix = "/tmp/";
  const tempName = prefix + randomstring;
  console.log("the temp name:");
  console.log(tempName);

  fs.writeFile(tempName, req.body, err => {
    if (err) {
      return console.log(err);
    }

    console.log("call ffprobe black detection:");
    const ffprobeCmd = `ffprobe -f lavfi -i "movie=${tempName},blackdetect[out0]"` +
      ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;


    exec(ffprobeCmd,
      (error, stdout, stderr) => {
        const result = {};
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);
        if (error !== null) {
          console.log("here is the exec error from ffprobe: ", error);
        }
        // becuase we're sending slices, the info will be within stderr
        const analysisArr = stderr.split("\n");
        console.log("this is the analysis array that we should filter:");
        console.log(analysisArr);
        const blackIntervals = analysisArr.filter(item => {
          return item.indexOf("black_duration") > -1;
        });

        console.log("my black intervals");
        console.log(blackIntervals);

        const blackObjs = blackIntervals.map(item => {
          // const temp = {};

          // if (item.indexOf("black_start") > -1) {
          //   temp.tag = "blackStart";
          // }
          // if (item.indexOf("black_end") > -1) {
          //   temp.tag = "blackEnd";
          // }
          // if (item.indexOf("black_duration") > -1) {
          //   temp.tag = "blackDuration";
          // }
          // temp.value = item.substr(item.indexOf("=") + 1);
          // return temp;
          return {
            start: item.substring(item.lastIndexOf("start:") + 6,
              item.indexOf("black_end") -1),
            end: item.substring(item.lastIndexOf("end:") + 4,
              item.indexOf("black_duration") -1),
            duration: item.substr(item.indexOf("black_duration:") + 15),
          };
        });
        // TODOmc take blackObjs array and transform to 'blackIntervals'
        // arr, with start, end, and duration
        console.log("my black objs:");
        console.log(blackObjs);
        result.error = stderr;
        result.blackDetect = blackObjs;
        res.json(result);
      });

    console.log("the temp file, for black detection, was saved");
  }); // writeFile
});

module.exports = router;
