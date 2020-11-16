'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

router.get('*.*', express.static(path.join(__dirname, '/../../sme-uploader/demo/')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../sme-uploader/demo/index.html'));
});

module.exports = router;
