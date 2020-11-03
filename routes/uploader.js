'use strict';

let express = require('express');
let router = express.Router();
const path = require('path');

router.get('*.*', express.static(path.join(__dirname, '/../../upload-demo/')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../upload-demo/index.html'));
});

module.exports = router;
