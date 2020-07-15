var express = require('express');
var router = express.Router();
const path = require('path');

// static files
router.get('*.*', express.static(path.join(__dirname, '/../client/dist/client/')));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../client/dist/client/index.html'));
});

// rest routes
router.get('/**', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../client/dist/client/index.html'));
});



module.exports = router;
