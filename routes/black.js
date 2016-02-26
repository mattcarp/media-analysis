/* eslint arrow-body-style: [2, "always"] */

"use strict";

const express = require("express");
const router = new express.Router();
const bunyan = require("bunyan");
const log = bunyan.createLogger({ name: "black" });

const fs = require("fs");
const prependFile = require("prepend-file");
const exec = require("child_process").exec;
let blackObjs = [];
let blackObj = {};
let blackString;
let blackInStdOut;

module.exports = router;

function processBlack(fileToProcess, callback) {
  let start;
  let end;
  let duration;
  const ffprobeCmd = `ffprobe -f lavfi -i "movie=${fileToProcess},blackdetect[out0]"` +
    ` -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1`;

  log.info("from processBlack, calling ffprobe black detection:");
  exec(ffprobeCmd,
    (error, stdout, stderr) => {
      const result = {};
      log.info("process black: ffprobe STDOUT:\n", stdout);
      log.info("proces black: ffprobe STDERR:\n", stderr);
      if (error !== null) {
        log.error({ foo: "bar", err: error }, "some msg about this error");
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

      const blackIntervals = analysisArr.filter(item => {
        return item.indexOf("black_start") > -1;
      });

      if (!blackInStdOut) {
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
        blackObjs = [];
        start = analysisArr[0].substring(analysisArr[0].lastIndexOf("start=") + 6);
        log.info("black detection found in stdout. start:\n", start);
        end = analysisArr[1].substring(analysisArr[1].lastIndexOf("end=") + 4);
        log.info("back in stout. end:\n", end);
        duration = parseFloat(end) - parseFloat(start);
        blackObj.tempFile = fileToProcess;
        blackObj.start = start;
        blackObj.end = end;
        blackObj.duration = duration;

        blackObjs.push(blackObj);
      }

      log.info("black objs, from processBlack:");
      log.info(blackObjs);
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
  log.info("headers send to black endpoint:");
  log.info(headers);

  log.info("black req.body and length:");
  log.info(req.body);
  log.info(req.body.length);

  if (position === "head") {
    fs.appendFile(fileToConcat, req.body, err => {
      if (err) {
        log.error("error while appending", err);
      }

      processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    }); // fs.append
  }

  if (position === "tail") {
    // var processedBytes;
    prependFile(fileToConcat, req.body, "binary", err => {
      if (err) {
        log.error("error while prepending", err);
      }
      // success
      processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    }); // prependFile
  }
}); // router.post

module.exports = router;
