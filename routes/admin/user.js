'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/user');

router.get('/', controller.listUsers);
router.post('/:id', controller.newUser);

module.exports = router;
