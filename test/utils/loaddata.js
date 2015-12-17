
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');
var sl = require('simplelists');
var async = require('simpleasync');

db.useMemory();

var userService = require('../../services/user');
var loanService = require('../../services/loan');

var datatest = require('../../data/datatest.json');

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['load data'] = function (test) {
    test.async();
    
    loaddata('../data/datatest.json', function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['users loaded'] = function (test) {
    test.async();
    
    userService.getUsers(function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.equal(data.length, datatest.users.length);
        test.done();
    });
};

exports['get users with scoring C'] = function (test) {
    test.async();
    
    userService.getUsersWithScoring('C', function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.all(data, { scoring: 'C' }));
        test.done();
    });
};

exports['get users without scoring'] = function (test) {
    test.async();
    
    userService.getUsersWithoutScoring(function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.all(data, { scoring: null }));
        test.done();
    });
};

exports['loans loaded'] = function (test) {
    test.async();
    
    loanService.getLoans(function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.equal(data.length, datatest.loans.length);
        
        sl.all(data, function (loan) { return loan.user });
        sl.all(data, function (loan) { return loan.amount });
        sl.all(data, function (loan) { return loan.created });
        
        test.done();
    });
};

