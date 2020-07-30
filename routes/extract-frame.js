/* eslint arrow-body-style: [2, "always"] */
'use strict';

const express = require('express');
const router = new express.Router();
const exec = require("child_process").exec;
const randomstring = require("randomstring");

// TODO temp hard-coded paths - move to the jest test (pass filepath from test)
const tempVidPath = 'test_assets/file_example_MP4_1920_18MG.mp4';
// TODO use template string
const outputDir = 'test_assets/test_output/' + randomstring.generate(12)  + 'output.jpg';

router.post('/', (req, res, next) => {
    // TODO take a file path and send back a 
    const headers = req.headers;
    console.info('you called the extract endpoint');
    console.info(`this is what was received from the extract req`, req.body);
    // TODO this ffmpeg path works on matt local, but won't work on server
    // TODO uses temp files
    let child = exec(`/usr/bin/ffmpeg -ss 2 -i ${tempVidPath} -qscale:v 2 -vframes 1 ${outputDir}`,

        function (error, stdout, stderr) {
            var result = {}
            console.log("STDOUT: ", stdout);
            console.log("STDERR: ", stderr);
            if (error !== null) {
                console.log("here is the exec error from ffmpeg:", error);
            }
            result.error = stderr;
            result.analysis = stdout;
            res.json(result);
         });
});

module.exports = router;
