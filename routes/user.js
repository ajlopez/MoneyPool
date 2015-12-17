'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/user');

router.get('/register', controller.registerUser);
router.get('/login', controller.loginUser);

module.exports = router;
