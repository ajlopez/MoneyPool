'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/my');

router.get('/', controller.viewMyUser);

module.exports = router;
    