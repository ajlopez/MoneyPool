'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/my');

router.get('/', controller.viewMyUser);
router.get('/loan', controller.listMyLoans);
router.get('/loan/new', controller.newMyLoan);
router.post('/loan/new', controller.createMyLoan);
router.get('/loan/:id', controller.viewMyLoan);

module.exports = router;
