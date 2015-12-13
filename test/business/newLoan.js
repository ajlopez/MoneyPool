
"use strict"

var db = require('../../utils/db');
var loanService = require('../../services/loan');
var userService = require('../../services/user');
var dates = require('../../utils/dates');
var async = require('simpleasync');
var scoring = require('../../scoring.json');

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
    
    loanService.newLoan({ user: adamId, amount: 1000, periods: 12 }, function (err, id) {
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
        
        test.equal(loan.user, adamId);
        test.equal(loan.id, loanId);
        test.equal(loan.status, 'open');
        test.equal(loan.currency, 'ARS');
        test.equal(loan.order, 1);
        test.equal(loan.code, 'adam-0001');
        test.equal(loan.scoring, 'A');
        test.equal(loan.monthlyRate, scoring.A.monthlyRate);
        test.equal(loan.periods, 12);
        test.equal(loan.days, 30);
        test.ok(dates.isDateTimeString(loan.created));
        
        test.done();
    });
};

