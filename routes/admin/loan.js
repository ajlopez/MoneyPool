'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/loan');

router.get('/', controller.listLoans);
router.post('/', controller.newLoan);
router.get('/:id', controller.viewLoan);

module.exports = router;
