
"use strict"

var db = require('../../utils/db');
var loanService = require('../../services/loan');
var userService = require('../../services/user');
var noteService = require('../../services/note');
var paymentService = require('../../services/payment');
var movementService = require('../../services/movement');

var dates = require('../../utils/dates');
var async = require('simpleasync');
var sl = require('simplelists');
var scoring = require('../../scoring.json');

var loanId;
var adamId;
var eveId;
var abelId;

var eveNoteId;
var abelNoteId;

var payments;

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['create loan user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'adam', firstName: 'Adam', lastName: 'Paradise', scoring: 'A' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        adamId = data;
        test.done();
    });
};

exports['create investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'eve', firstName: 'Eve', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        eveId = data;
        test.done();
    });
};

exports['create second investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'abel', firstName: 'Abel', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        abelId = data;
        test.done();
    });
};

exports['new loan'] = function (test) {
    test.async();
    
    loanService.newLoan({ user: adamId, amount: 1000, periods: 12, days: 30 }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['new note from first investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId, { user: eveId, amount: 600 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        eveNoteId = data;
        
        test.done();
    });
};

exports['new note from second investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId, { user: abelId, amount: 400 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        abelNoteId = data;
        
        test.done();
    });
};

exports['accept loan'] = function (test) {
    test.async();
    
    var loan;

    async()
    .then(function (data, next) {
        loanService.acceptLoan(loanId, next);
    })
    .then(function (data, next) {
        paymentService.getPaymentsByLoan(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        
        payments = data;
        
        test.done();
    })
    .run();
};

exports['make first payment'] = function (test) {
    test.async();

    var payment = payments[0];
    var amount = payment.capital + payment.interest;
    var date = payment.date;
    var status;
    
    async()
    .then(function (data, next) {
        loanService.doPayment(loanId, { amount: amount, datetime: date + " 00:00:00" }, next);
    })
    .then(function (data, next) {
        loanService.getLoanStatusToDate(loanId, date, next);
    })
    .then(function (data, next) {
        test.ok(data);
        
        status = data;
        
        test.ok(data.payments);
        test.equal(data.payments[0].capital, data.payments[0].canceled);
        test.ok(data.movements);
        test.equal(data.movements.length, 1);
        
        var movement = data.movements[0];
        
        test.ok(movement.id);
        test.equal(movement.loan, loanId);
        test.equal(movement.currency, status.loan.currency);
        test.equal(movement.user, status.loan.user);
        test.equal(movement.amount, amount);
        test.equal(movement.type, 'payment');
        test.ok(dates.isDateTimeString(movement.datetime));
        test.equal(movement.capital, payments[0].capital);
        test.equal(movement.interest, payments[0].interest);
        
        movementService.getMovementsByUser(eveId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(sl.exist(data, {
            loan: loanId,
            user: eveId,
            type: 'return',
            currency: status.loan.currency,
            debit: 0,
            credit: amount * 600 / status.loan.amount
        }));
        
        movementService.getMovementsByUser(abelId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        sl.exist(data, {
            loan: loanId,
            user: abelId,
            type: 'return',
            amount: amount * 400 / status.loan.amount
        })
        
        test.done();
    })
    .run();
}

