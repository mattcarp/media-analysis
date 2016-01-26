var express = require('express');
var router = express.Router();

/* post file slice for black detection. */
router.get('/', function(req, res, next) {
  res.send('whe should perform black detection at this point');
});

module.exports = router;
