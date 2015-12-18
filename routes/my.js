'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/my');

router.get('/', controller.viewMyUser);

router.get('/loan', controller.listMyLoans);
router.get('/loan/new', controller.newMyLoan);
router.post('/loan/new', controller.createMyLoan);
router.get('/loan/:id', controller.viewMyLoan);
router.get('/loan/:id/accept', controller.acceptMyLoan);
router.get('/loan/:id/reject', controller.rejectMyLoan);

router.get('/invest/do', controller.doInvest);

router.get('/oloan/:id', controller.viewOpenLoan);
router.get('/oloan/:id/note/new', controller.newNote);
router.post('/oloan/:id/note/new', controller.createNote);

router.get('/loan/:id/pay/new', controller.newPayment);
router.post('/loan/:id/pay/new', controller.createPayment);

router.get('/movement', controller.listMyMovements);

module.exports = router;
