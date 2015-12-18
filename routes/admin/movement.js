'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/movement');

router.get('/', controller.listMovements);

module.exports = router;
