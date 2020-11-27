import { Router } from 'express';
import * as fs from 'fs';
import bunyan from 'bunyan';
import * as prependFile from 'prepend-file';

const log = bunyan.createLogger({ name: 'black-route' });
const blackDetect = require('../server-methods/black-detect');
const blackRouter = Router();

blackRouter.post('/', (req, res) => {
  const headers = req.headers;
  const prefix = '/tmp/';
  const fileToConcat = prefix + headers['xa-file-to-concat'];
  const position = headers['xa-black-position'];
  log.info('headers send to black endpoint:');
  log.info(headers);

  log.info('black req.body and length:');
  log.info(req.body);
  log.info(req.body.length);

  if (position === 'head') {
    fs.appendFile(fileToConcat, req.body, err => {
      if (err) {
        log.error('error while appending', err);
      }

      blackDetect.processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    });
  }

  if (position === 'tail') {
    prependFile(fileToConcat, req.body).then(() => {
      blackDetect.processBlack(fileToConcat, (result) => {
        res.json(result);
      }).catch((err) => {
        log.error('error while prepending', err);
      });
    });
  }
});

export { blackRouter };
