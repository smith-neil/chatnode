'use strict';

const
  express = require('express'),
  router  = express.Router();

// GET /
router.get('/', function (req, res) {
	res.render('index', { 'title': 'chatnode' });
});

module.exports = router;