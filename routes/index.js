var express = require('express');
var router = express.Router();
const path = require('path');

// static files
router.get('*.*', express.static(path.join(__dirname, '/../client/dist/client/')));

// version of the app
router.get('/uploader/version', function(req, res, next) {
  const version = require('../../upload-demo/package.json').version;
  res.send(version);
});

router.get('/promo-uploader/version', (req, res, next) => {
  const version = require('../../promo-uploader/package.json').version;
  res.send(version);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../client/dist/client/index.html'));
});

// rest routes
router.get('/**', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../client/dist/client/index.html'));
});



module.exports = router;
