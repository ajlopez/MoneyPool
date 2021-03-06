
"use strict"

var db = require('../../utils/db');
var loanService = require('../../services/loan');
var userService = require('../../services/user');
var dates = require('../../utils/dates');
var async = require('simpleasync');
var scorings = require('../../data/scorings.json');

var loanId;
var adamId;
var eveId;

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

exports['new loan'] = function (test) {
    test.async();
    
    loanService.newLoan({ user: adamId.toString(), amount: 1000, periods: 12 }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['get loan by id'] = function (test) {
    test.async();
    
    loanService.getLoanById(loanId, function (err, loan) {
        test.ok(!err);
        test.ok(loan);
        test.equal(typeof loan, 'object');
        
        test.ok(db.isNativeId(loan.user));
        test.ok(db.isNativeId(loan.id));
        test.equal(loan.user.toString(), adamId.toString());
        test.equal(loan.id.toString(), loanId.toString());
        test.equal(loan.status, 'open');
        test.equal(loan.currency, 'ARS');
        test.equal(loan.order, 1);
        test.equal(loan.code, 'adam-0001');
        test.equal(loan.scoring, 'A');
        test.equal(loan.monthlyRate, scorings.A.monthlyRate);
        test.equal(loan.periods, 12);
        test.equal(loan.days, 30);
        test.ok(dates.isDateTimeString(loan.created));
        
        test.done();
    });
};

