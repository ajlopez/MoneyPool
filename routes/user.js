'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/user');

router.get('/register', controller.registerUser);
router.post('/register', controller.createUser);

router.get('/data', controller.dataUser);
router.post('/data', controller.updateUser);

router.get('/login', controller.loginUser);
router.post('/login', controller.authenticateUser);

router.get('/logout', controller.logoutUser);

module.exports = router;
    