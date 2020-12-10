import { Router } from 'express';
import * as fs from 'fs';
import * as stream from 'stream';
import * as randomstring from 'randomstring';
import { exec } from 'child_process';

const analysisRouter = Router();

analysisRouter.post('/', (req, res) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.body);

  console.log('content type:');
  console.log(req.headers['content-type']);

  console.log('req.body and length:');
  console.log(req.body);
  console.log(req.body.length);

  const tempName = '/tmp/' + randomstring.generate(12);
  console.log('the temp name:');
  console.log(tempName);

  fs.writeFile(tempName, req.body, (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('call ffprobe with exec:');
    exec(`ffprobe -of json -show_streams -v error -show_format ${tempName}`,

      (error, stdout, stderr) => {
        const result: any = {};
        console.log('STDOUT: ', stdout);
        console.log('STDERR: ', stderr);
        if (error !== null) {
          console.log('here is the exec error from ffprobe:', error);
        }
        result.error = stderr;
        result.analysis = stdout;
        res.json(result);
      });

    console.log('the temp file was saved');
  });
});

export { analysisRouter };
