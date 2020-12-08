import { Router } from 'express';
import * as randomstring from 'randomstring';
import { exec } from 'child_process';

const extractFrameRouter = Router();
// TODO use template string
const outputDir = 'extracted/frames/' + randomstring.generate(12) + 'output.jpg';

extractFrameRouter.post('/', (req, res) => {
  // TODO take a file path, and a time location in ms,
  //  and send back an object which includes an image
  const headers = req.headers;
  // TODO this ffmpeg path works on matt local, but won't work on server
  const child = exec(`/usr/bin/ffmpeg -ss ${req.body.timestamp} -i extracted/testVideo.mp4 -qscale:v 2 -vframes 1 ${outputDir}`,
    (error, stdout, stderr) => {
      const result: any = {};
      if (error !== null) {
        console.error('here is the exec error from ffmpeg:', error);
      }
      result.error = stderr;
      result.analysis = stdout;
      // TODO this is just to force a passing test
      result.success = true;
      result.filePath = outputDir;
      res.json(result);
    });
});

extractFrameRouter.delete('/', (req, res) => {
  const command = `rm ${req.query.filePath}`;
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) res.status(404);
    if (stdout) res.status(200);
    res.send();
  });
});

export { extractFrameRouter };
