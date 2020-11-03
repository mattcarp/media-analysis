'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

router.get('*.*', express.static(path.join(__dirname, '/../../sme-uploader/')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../sme-uploader/index.html'));
});

module.exports = router;
