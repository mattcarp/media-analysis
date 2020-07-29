/* eslint arrow-body-style: [2, "always"] */
'use strict';

const express = require('express');
const router = new express.Router();
const exec = require("child_process").exec;

router.post('/', (req, res) => {
    // TODO this is just a stub
    const headers = req.headers;
    console.info('you called the extract endpoint');
    console.info(`this is what was received from the extract req`, req.body);
    res.json({
        "key": "hello"
    })
});

module.exports = router;
