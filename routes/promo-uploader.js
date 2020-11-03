'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

router.get('*.*', express.static(path.join(__dirname, '/../../promo-uploader/')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../promo-uploader/index.html'));
});

module.exports = router;
