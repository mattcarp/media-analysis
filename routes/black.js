/* eslint arrow-body-style: [2, "always"] */

'use strict';

const express = require('express');
const router = new express.Router();
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'black-route' });
const fs = require('fs');
const prependFile = require('prepend-file');
const exec = require('child_process').exec;

const blackDetect = require('../server-methods/black-detect');

const blackObj = {};
let blackObjs = [];
let blackString;
let blackInStdOut;

module.exports = router;

router.post('/', (req, res) => {
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
    }); // fs.append
  }

  if (position === 'tail') {
    // var processedBytes;
    prependFile(fileToConcat, req.body, 'binary', err => {
      if (err) {
        log.error('error while prepending', err);
      }
      // success
      blackDetect.processBlack(fileToConcat, (result) => {
        res.json(result);
      });
    }); // prependFile
  }
}); // router.post

module.exports = router;
