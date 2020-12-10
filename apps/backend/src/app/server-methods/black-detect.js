'use strict';

const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'black-detect' });
const exec = require('child_process').exec;

module.exports = {
  processBlack: function (fileToProcess, callback) {
    let blackInStdOut;
    let blackString;
    const blackObj = {};
    let blackObjs = [];
    let start;
    let end;
    let duration;
    const ffprobeCmd = `ffprobe -f lavfi -i 'movie=${fileToProcess},blackdetect[out0]'`
      + ' -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1';

    log.info('from processBlack, calling ffprobe black detection:');
    exec(ffprobeCmd,
      (error, stdout, stderr) => {
        const result = {};
        log.info('process black: ffprobe STDOUT:\n', stdout);
        log.info('process black: ffprobe STDERR:\n', stderr);
        if (error !== null) {
          log.error({ foo: 'bar', err: error }, 'some msg about this error');
        }

        // TODO black can be in either stdout or stderr
        if (stdout.indexOf('black_end') > -1) {
          blackInStdOut = true;
          blackString = stdout;
        } else {
          blackInStdOut = false;
          blackString = stderr;
        }
        const analysisArr = blackString.split('\n');

        const blackIntervals = analysisArr.filter(item => {
          return item.indexOf('black_start') > -1;
        });

        if (!blackInStdOut) {
          blackObjs = blackIntervals.map(item => {
            return {
              tempFile: fileToProcess,
              start: item.substring(item.lastIndexOf('start:') + 6,
                item.indexOf('black_end') - 1),
              end: item.substring(item.lastIndexOf('end:') + 4,
                item.indexOf('black_duration') - 1),
              duration: item.substr(item.indexOf('black_duration:') + 15)
            };
          });
        }

        if (blackInStdOut) {
          blackObjs = [];
          start = analysisArr[0].substring(analysisArr[0].lastIndexOf('start=') + 6);
          log.info('black detection found in stdout. start:\n', start);
          end = analysisArr[1].substring(analysisArr[1].lastIndexOf('end=') + 4);
          log.info('black in stout. end:\n', end);
          duration = parseFloat(end) - parseFloat(start);
          blackObj.tempFile = fileToProcess;
          blackObj.start = start;
          blackObj.end = end;
          blackObj.duration = parseFloat(duration);

          blackObjs.push(blackObj);
        }

        log.info('black objs, from processBlack:');
        log.info(blackObjs);
        result.error = stderr;
        result.blackDetect = blackObjs;
        callback(result);
      }); // exec
  }
};
