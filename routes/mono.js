/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = express.Router();
const fs = require("fs");
const randomstring = require("randomstring");
const exec = require("child_process").exec;
const monoResult = {};

module.exports = router;

function demux(fileToProcess, callback) {
  const wavOutPath = "/tmp/" + randomstring.generate(12) + ".wav";
  console.log("in demux, this is the file to process:", fileToProcess);
  const demuxCmd = `ffmpeg -i ${fileToProcess} ${wavOutPath}`;

  console.log("call ffmpeg demux:");

  exec(demuxCmd,
    (error, stdout, stderr) => {
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      if (error !== null) {
        console.log("demux: exec error from ffmpeg: ", error);
      }
      monoResult.wavPath = wavOutPath;
      monoResult.demuxErr = stderr;
      callback(monoResult);
    }); // exec
}

function monoDetect(wavFile, callback) {
  console.log("you passed this to monodetect as the wav file path", wavFile);
  // const wavFile2 = "/tmp/dual_mono_from_video.wav";
  const soxCmd = `sox ${wavFile} -n remix 1,2i stats`;

  exec(soxCmd,
    (error, stdout, stderr) => {
      console.log("monoDetect STDOUT:", stdout);
      // TODO if stderr contains "No such file or directory", fail gracefully
      console.log("monoDetect STDERR:", stderr);
      if (error !== null) {
        console.log("demux: exec error from SoX: ", error);
        if (stderr.indexOf("No such file or directory" > -1)) {
          console.log("the demuxed wav file passed to SoX was not found")
          monoResult.detectErr = "demuxed wav file was not found";
          // callback(result);
        }

      }

      const soxArr = stderr.trim().split("\n");
      console.log("soxArr");
      console.log(soxArr);
      const peakRms = soxArr.filter((line) => {
        // TODO why is file not found for middle and end segments
        console.log("mono line:", line);
        return line.indexOf("RMS Pk dB") > -1;
      });
      if (peakRms[0]) {
        const peakVal = peakRms[0].substr(peakRms[0].length - 4);
        console.log("peak rms value:", peakVal);
        if (peakVal === "-inf") {
          monoResult.isMono = true;
        } else {
          console.log("this audio is not mono");
          monoResult.isMono = false;
        }

        monoResult.data = soxArr;
        console.log("from within monoDetect gonna return:", monoResult);
      } else {
        monoResult.err = "Error: peak rms value is undefined";
      }

      callback(monoResult);
    }); // detect mono exec
}

router.post("/", (req, res) => {
  const headers = req.headers;
  const prefix = "/tmp/";
  const tempFile = prefix + randomstring.generate(12);
  const position = headers["xa-chunk-position"];
  console.log("the position for mono detect:", position);
  console.log("the incoming ip:", req.socket.remoteAddress);
  console.log("mono detect: headers:");
  console.log(headers);

  // const bufferStream = new stream.PassThrough();
  // bufferStream.end(req.body);
  console.log("the plan is to write this file path:", tempFile);
  // req.on("end", () => {
  fs.writeFile(tempFile, req.body, (err) => {
    // res.end();
    console.log("was there an error on mono writeFile?");
    console.log(err);
  });
  // });

  console.log("mono req.body and body.length:");
  console.log(req.body);
  console.log(req.body.length);

  demux(tempFile, (result) => {
    // callback after demux is finished
    console.log("result from demux, which should include a wav file path:");
    console.dir(result);
    // console.log(result);
    monoDetect(result.wavPath, (detectResult) => {
      // callback after monoDetect is done
      console.log("inside the callback, this is what i got back from monoDetect", detectResult);
      res.json(detectResult);
    });
  });
}); // router.post


module.exports = router;
