/* eslint no-var: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = new express.Router();
const bunyan = require("bunyan");
const log = bunyan.createLogger({ name: "mono-soon-to-be-audio-signal" });
const fs = require("fs");
const randomstring = require("randomstring");
const exec = require("child_process").exec;
// const monoResult = {};
// TODO avoid side effects by passing the result object between functions
const result = {};

// module.exports = router;

function demux(fileToProcess, callback) {
  const wavOutPath = `/tmp/${randomstring.generate(12)}.wav`;
  log.info("in demux, this is the file to process:", fileToProcess);
  const demuxCmd = `ffmpeg -i ${fileToProcess} ${wavOutPath}`;


  exec(demuxCmd, (error, stdout, stderr) => {
    log.info("called ffmpeg demux:");
    log.info("STDOUT:", stdout);
    log.error("STDERR:", stderr);
    if (error !== null) {
      log.error("demux: exec error from ffmpeg: ", error);
    }
    result.wavPath = wavOutPath;
    result.demuxErr = stderr;
    callback(result);
  }); // demux exec
} // demux

function monoDetect(wavFile, callback) {
  // TODO make sure you've already called stereoPeakDetect by now
  log.info("you passed this to monodetect as the wav file path", wavFile);
  const soxCmd = `sox ${wavFile} -n remix 1,2i stats`;

  exec(soxCmd, (error, stdout, stderr) => {
    log.info("STDOUT:", stdout);
    // TODO if stderr contains "No such file or directory", fail gracefully
    log.info("STDERR:", stderr);
    if (error !== null) {
      log.info("demux: exec error from SoX:", error);
      if (stderr.indexOf("No such file or directory" > -1)) {
        log.error("the demuxed wav file passed to SoX was not found");
        result.detectErr = "demuxed wav file was not found";
      }
    }

    const soxArr = stderr.trim().split("\n");
    log.info("soxArrarry:");
    log.info(soxArr);
    const monoPeakRms = soxArr.filter(line => {
      log.info("mono line:", line);
      return line.indexOf("RMS Pk dB") > -1;
    });

    if (monoPeakRms[0]) {
      const peakVal = monoPeakRms[0].substr(monoPeakRms[0].length - 4);
      log.info("peak rms value:", peakVal);
      if (peakVal === "-inf") {
        result.isMono = true;
      } else {
        // TODO handle error where monoPeakRms is undefined or null
        log.info("this audio is not mono: the value found was", monoPeakRms[0]);
        result.isMono = false;
      }
      log.error("NOT gonna add this mono sox array to the returned resutl:", soxArr); // looks fine
      // monoResult.data = soxArr;
    } else {
      result.err = "Error: peak rms value is undefined";
    }

    callback(result);
  }); // detect mono exec
}

function stereoPeakDetect(wavFile, callback) {
  var stereoResult = {};
  var soxCmd = `sox ${wavFile} -n stats`;
  const PEAK_THRESHOLD = -6;

  exec(soxCmd, (error, stdout, stderr) => {
    log.info("STDOUT:", stdout);
    // TODO if stderr contains "No such file or directory", fail gracefully
    log.info("STDERR:", stderr);
    if (error !== null) {
      log.info("demux: exec error from SoX:", error);
      if (stderr.indexOf("No such file or directory" > -1)) {
        log.error("the demuxed wav file passed to SoX was not found");
        stereoResult.detectErr = "demuxed wav file was not found";
      }
    }

    const soxArr = stderr.trim().split("\n");
    log.info("from stereo peak analysis, the sox array:");
    log.info(soxArr);
    const stereoPeakLev = soxArr.filter(line => {
      return line.indexOf("Pk lev dB") > -1;
    });

    if (stereoPeakLev[0]) {
      const peakVal = parseFloat(stereoPeakLev[0].substr(10).trim().split(" ")[0]);

      log.info("stereo peak level value:", peakVal);
      // if (peakVal > PEAK_THRESHOLD) {
      //   stereoResult.overThreshold = true;
      // } else {
      //   // TODO handle error if stereoPeakLev is undefined or null
      //   log.info("value found for stereo peak level:", stereoPeakLev[0]);
      //   stereoResult.peakLevel = stereoPeakLev[0];
      // }
      log.error("gonna add this stereo sox array to the returned resutl:",
       soxArr); // looks fine
      result.peakLevel = peakVal;
      result.data = soxArr;
    } else {
      result.stereoErr = "Error: peak rms value is undefined";
    }

    callback(stereoResult);
  }); // stereo peak exec
}

router.post("/", (req, res) => {
  const headers = req.headers;
  const prefix = "/tmp/";
  const tempFile = prefix + randomstring.generate(12);
  const position = headers["xa-chunk-position"];
  log.info("the position for mono detect:", position);
  log.info("the incoming ip:", req.socket.remoteAddress);
  log.info("mono detect: headers:");
  log.info(headers);

  log.info("the plan is to write this file path:", tempFile);
  // req.on("end", () => {
  fs.writeFile(tempFile, req.body, (err) => {
    // res.end();
    log.info("was there an error on mono writeFile?");
    log.error(err);
    // TODO pass the file path
    demux(tempFile, (demuxResult) => {
      // callback after demux is finished
      log.info("result from demux, which should include a wav file path:");
      log.info(result);
      stereoPeakDetect(demuxResult.wavPath, (peakDetectResult) => {
        // callback after stereoResult is finished
        log.info("hello from the callback for stereoPeakDetect, where result is", peakDetectResult);
        log.info("this is where i should call mono detect, because stereo is done");

        // TODO we are approaching callback hell
        monoDetect(demuxResult.wavPath, () => {
          // callback after monoDetect is done
          log.info("inside the mono callback, this is what i got for the whole enchilada",
            result);
          res.json(result);
        });
      });
    });
  });

  // log.info("mono req.body and body.length:");
  // log.info(req.body);
  // log.info(req.body.length);
}); // router.post


module.exports = router;
