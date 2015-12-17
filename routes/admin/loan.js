'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/loan');

router.get('/', controller.listLoans);
router.post('/:id', controller.newLoan);

module.exports = router;
