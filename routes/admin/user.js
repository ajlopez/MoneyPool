'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/user');

router.get('/', controller.listUsers);
router.post('/', controller.newUser);

router.get('/:id', controller.viewUser);
router.get('/:id/scoring/:scoring', controller.qualifyUser);

module.exports = router;
