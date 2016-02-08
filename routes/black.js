/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = express.Router();
const fs = require("fs");
const stream = require("stream");
const exec = require("child_process").exec;
// const child;
// let result;

module.exports = router;

router.post("/", (req, res) => {
  const headers = req.headers;
  const prefix = "/tmp/";
  const fileToConcat = prefix + headers["xa-file-to-concat"];
  const ffprobeCmd = `ffprobe -f lavfi -i "movie=${fileToConcat},blackdetect[out0]"` +
    ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.body);
  console.log("black req.body and length:");
  console.log(req.body);
  console.log(req.body.length);

  if (fileToConcat) {
    console.log("== we are in append mode ==");
    console.log("the file to be concatenated:");
    console.log(fileToConcat);
    fs.appendFile(fileToConcat, req.body, err => {
      if (err) {
        console.log("error while appending", err);
      }
      console.log("hopefully, we just appended", fileToConcat,
        "which now has these stats:");
      // tempName = fileToConcat;
      fs.stat(fileToConcat, (err2, stats) => {
        console.log(stats);
      });

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
          const analysisArr = stderr.split("\n");
          console.log("this is the analysis array that we should filter:");
          console.log(analysisArr);
          const blackIntervals = analysisArr.filter(item => {
            return item.indexOf("black_duration") > -1;
          });

          console.log("black intervals:");
          console.log(blackIntervals);

          const blackObjs = blackIntervals.map(item => {
            return {
              tempFile: fileToConcat,
              start: item.substring(item.lastIndexOf("start:") + 6,
                item.indexOf("black_end") - 1),
              end: item.substring(item.lastIndexOf("end:") + 4,
                item.indexOf("black_duration") - 1),
              duration: item.substr(item.indexOf("black_duration:") + 15),
            };
          });
          result.error = stderr;
          result.blackDetect = blackObjs;
          res.json(result);
        }); // exec
    });
  }

  // fs.writeFile(fileToConcat, req.body, err => {
  //   if (err) {
  //     return console.log(err);
  //   }

  // console.log("call ffprobe black detection:");
  // exec(ffprobeCmd,
  //   (error, stdout, stderr) => {
  //     const result = {};
  //     console.log("STDOUT:", stdout);
  //     console.log("STDERR:", stderr);
  //     if (error !== null) {
  //       console.log("here is the exec error from ffprobe: ", error);
  //     }
  //     // becuase we're sending slices, the info will be within stderr
  //     const analysisArr = stderr.split("\n");
  //     console.log("this is the analysis array that we should filter:");
  //     console.log(analysisArr);
  //     const blackIntervals = analysisArr.filter(item => {
  //       return item.indexOf("black_duration") > -1;
  //     });
  //
  //     console.log("black intervals:");
  //     console.log(blackIntervals);
  //
  //     const blackObjs = blackIntervals.map(item => {
  //       return {
  //         tempFile: fileToConcat,
  //         start: item.substring(item.lastIndexOf("start:") + 6,
  //           item.indexOf("black_end") - 1),
  //         end: item.substring(item.lastIndexOf("end:") + 4,
  //           item.indexOf("black_duration") - 1),
  //         duration: item.substr(item.indexOf("black_duration:") + 15),
  //       };
  //     });
  //     result.error = stderr;
  //     result.blackDetect = blackObjs;
  //     res.json(result);
  //   }); // exec

  // console.log("the temp file, for black detection, was saved");
  // }); // writeFile
});

module.exports = router;
