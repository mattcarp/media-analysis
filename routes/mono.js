/* eslint no-var: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = new express.Router();
const bunyan = require("bunyan");
const log = bunyan.createLogger({ name: "mono-soon-to-be-audio-signal" });
const fs = require("fs");
const randomstring = require("randomstring");
const exec = require("child_process").exec;
const monoResult = {};

module.exports = router;

function demux(fileToProcess, callback) {
  const wavOutPath = `/tmp/${randomstring.generate(12)}.wav`;
  log.info("in demux, this is the file to process:", fileToProcess);
  const demuxCmd = `ffmpeg -i ${fileToProcess} ${wavOutPath}`;

  log.info("calling ffmpeg demux:");
  exec(demuxCmd,
    (error, stdout, stderr) => {
      log.info("STDOUT:", stdout);
      log.info("STDERR:", stderr);
      if (error !== null) {
        log.error("demux: exec error from ffmpeg: ", error);
      }
      monoResult.wavPath = wavOutPath;
      monoResult.demuxErr = stderr;
      callback(monoResult);
    }); // demux exec
} // demux

function monoDetect(wavFile, callback) {
  // TODO make sure you've already called stereoPeakDetect by now
  log.info("you passed this to monodetect as the wav file path", wavFile);
  const soxCmd = `sox ${wavFile} -n remix 1,2i stats`;
  log.error("this is your sox command:", soxCmd);

  exec(soxCmd, (error, stdout, stderr) => {
    log.info("STDOUT:", stdout);
    // TODO if stderr contains "No such file or directory", fail gracefully
    log.info("STDERR:", stderr);
    if (error !== null) {
      log.info("demux: exec error from SoX:", error);
      if (stderr.indexOf("No such file or directory" > -1)) {
        log.error("the demuxed wav file passed to SoX was not found");
        monoResult.detectErr = "demuxed wav file was not found";
      }
    }

    const soxArr = stderr.trim().split("\n");
    log.info("soxArrarry:");
    log.info(soxArr);
    const monoPeakRms = soxArr.filter(line => {
      log.info("mono line:", line);
      return line.indexOf("RMS Pk dB") > -1;
    });
    log.error("so, shithead, the peak line for mono is", monoPeakRms);
    if (monoPeakRms[0]) {
      const peakVal = monoPeakRms[0].substr(monoPeakRms[0].length - 4);
      log.info("peak rms value:", peakVal);
      if (peakVal === "-inf") {
        monoResult.isMono = true;
      } else {
        // TODO handle error where monoPeakRms is undefined or null
        log.info("this audio is not mono: the value found was", monoPeakRms[0]);
        monoResult.isMono = false;
      }
      log.error("me gonna add this array to the returned resutl:", soxArr); // looks fine
      monoResult.data = soxArr;
    } else {
      monoResult.err = "Error: peak rms value is undefined";
    }

    callback(monoResult);
  }); // detect mono exec
}

function stereoPeakDetect() {
  log.error("you called stereo peak detect - trick is to get peak rms before phase flip and sum");
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
    // TODO um, shouldn't you call the next function inside this callback?
    // this might explain intermittent errors
    // TODO pass the file path
    stereoPeakDetect();
  });

  // log.info("mono req.body and body.length:");
  // log.info(req.body);
  // log.info(req.body.length);


  demux(tempFile, (result) => {
    // callback after demux is finished
    log.info("result from demux, which should include a wav file path:");
    log.info(result);
    // log.info(result);
    monoDetect(result.wavPath, (detectResult) => {
      // callback after monoDetect is done
      log.info("inside the callback, this is what i got back from monoDetect", detectResult);
      res.json(detectResult);
    });
  });
}); // router.post


module.exports = router;
