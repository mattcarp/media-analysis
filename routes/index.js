var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Media Analysis' });
});

router.get('/black', function(req, res, next) {
  res.render('junk', { title: 'Black Detection' });
});

module.exports = router;
