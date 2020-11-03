'use strict';

let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource, right?');
});

module.exports = router;
