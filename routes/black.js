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
      ` -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet`;

    exec(ffprobeCmd,
      (error, stdout, stderr) => {
        const result = {};
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);
        if (error !== null) {
          console.log("here is the exec error from ffprobe: ", error);
        }
        // TODOmc filter empty elements
        const analysisArr = stdout.split("\n").filter(item => item !== "");
        console.log("my analysisArr");
        console.log(analysisArr);

        const blackObjs = analysisArr.map(item => {
          const temp = {};
          if (item.indexOf("black_start") > -1) {
            temp.tag = "blackStart";
          }
          if (item.indexOf("black_end") > -1) {
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
      });

    console.log("the temp file was saved");
  }); // writeFile
});

module.exports = router;
