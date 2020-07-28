/* eslint arrow-body-style: [2, "always"] */
'use strict';

const express = require('express');
const router = new express.Router();
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'frame-extract-route' });
const fs = require('fs');
const prependFile = require('prepend-file');
// const exec = require('child_process').exec;

// const frameExtract = require('../server-methods/extract-frame');
module.exports = router;

router.post('/', (req, res) => {
    // TODO this is just a stub
    const headers = req.headers;
    const prefix = '/tmp/';
    const fileToConcat = prefix + headers['xa-file-to-concat'];
    const position = headers['xa-black-position'];
    log.info('headers sent to extractFrame endpoint:');
    log.info(headers);
    log.info(req.body);
    log.info(req.body.length);

});

module.exports = router;
