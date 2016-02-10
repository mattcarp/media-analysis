/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const router = express.Router();
const fs = require("fs");
const randomstring = require("randomstring");
const exec = require("child_process").exec;

module.exports = router;

function demux(fileToProcess, callback) {
  const demuxCmd = `ffmpeg -i ${fileToProcess} /tmp/output_audio.wav`;
  console.log("call ffprobe black detection:");

  console.log("call ffmpeg demux:");

  exec(demuxCmd,
    (error, stdout, stderr) => {
      const result = {};
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      if (error !== null) {
        console.log("demux: exec error from ffmpeg: ", error);
      }
      // becuase we're sending slices, the info will be within stderr
      // TODO is the above true even if we force the format?
      const analysisArr = stderr.split("\n");
      // const analysisArr = stdout==.split("\n");

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
      result.wavFile =
      result.error = stderr;
      result.blackDetect = blackObjs;
      callback(result);
    }); // exec
}

function monoDetect(wavFile) {
  console.log("you passed this to monodetect as the wav file path", wavFile);
  const wavFile2 = "/tmp/dual_mono_from_video.wav";
  const soxCmd = `sox ${wavFile2} -n remix 1,2i stats`;
  // var isMono;
  exec(soxCmd,
    (error, stdout, stderr) => {
      const result = {};
      console.log("monoDetect STDOUT:", stdout);
      console.log("monoDetect STDERR:", stderr);
      if (error !== null) {
        console.log("demux: exec error from ffmpeg: ", error);
      }

      const soxArr = stderr.split("\n");
      console.log("soxArr");
      console.log(soxArr);
      const peakRms = soxArr.filter((line) => {
        console.log("mono line:", line);
        return line.indexOf("RMS Pk dB") > -1;
      });

      const peakVal = peakRms[0].substr(peakRms[0].length - 4);
      console.log("peak rms value:", peakVal);
      if (peakVal === "-inf") {
        result.isMono = true;
      } else {
        result.isMono = false;
      }
      result.error = stderr;

      return result;
      // callback(result);
    }); // exec
}

router.post("/", (req, res) => {
  const headers = req.headers;
  const prefix = "/tmp/";
  const tempFile = prefix + randomstring.generate(12);
  console.log("mono detect: me headers are");
  console.log(headers);

  // const bufferStream = new stream.PassThrough();
  // bufferStream.end(req.body);

  req.on("end", () => {
    fs.appendFile(tempFile, req.body, () => {
      res.end();
    });
  });

  console.log("mono req.body and length:");
  console.log(req.body);
  console.log(req.body.length);

  demux(tempFile, (result) => {
    // callback after demux is finished
    console.log("this is the result from demus:", JSON.stringify(result, null, 2));
    // console.log(result);
    var bar = monoDetect(result.wavFile);
    console.log("this is what i got back from monoDetect", bar);
    res.json(monoDetect(result.wavFile));
    // res.json(result);
  });
}); // router.post


module.exports = router;
