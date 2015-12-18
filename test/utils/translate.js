
var translate = require('../../utils/translate');
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');
var async = require('simpleasync');
var sl = require('simplelists');

var userService = require('../../services/user');
var loanService = require('../../services/loan');

db.useMemory();

var statuses = require('../../data/statuses.json');
var movtypes = require('../../data/movtypes.json');
var scorings = require('../../data/scorings.json');

var users;
var loans;

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

exports['translate scoring'] = function (test) {
    for (var key in scorings) {
        test.equal(translate.scoring(key), scorings[key].description);
    }
};

exports['translate scorings'] = function (test) {
    var data = [
        { scoring: 'A' },
        { scoring: 'B' },
        { }
    ];
    
    translate.scorings(data);
    
    test.equal(data[0].scoringDescription, translate.scoring(data[0].scoring));
    test.equal(data[1].scoringDescription, translate.scoring(data[1].scoring));
    test.equal(data[2].scoringDescription, translate.scoring(data[2].scoring));
};

exports['translate status'] = function (test) {
    for (var key in statuses) {
        test.equal(translate.status(key), statuses[key].description);
    }
};

exports['translate statuses'] = function (test) {
    var data = [
        { status: 'open' },
        { status: 'rejected' }
    ];
    
    translate.statuses(data);
    
    test.equal(data[0].statusDescription, translate.status(data[0].status));
    test.equal(data[1].statusDescription, translate.status(data[1].status));
};

exports['translate movement type'] = function (test) {
    for (var key in movtypes) {
        test.equal(translate.movtype(key), movtypes[key].description);
    }
};

exports['translate movement types'] = function (test) {
    var data = [
        { status: 'note' },
        { status: 'loan' }
    ];
    
    translate.movtypes(data);
    
    test.equal(data[0].typeDescription, translate.movtype(data[0].type));
    test.equal(data[1].typeDescription, translate.movtype(data[1].type));
};

exports['translate user'] = function (test) {
    test.async();
    
    var user;
    
    async()
    .then(function (data, next) {
        userService.getUsers(next);
    })
    .then(function (data, next) {
        user = data[0];
        users = data;
        
        translate.user(user.id, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data, user.username);
        test.done();
    })
    .run();
};

exports['translate users'] = function (test) {
    test.async();
    
    var items = [];
    
    users.forEach(function (user) {
        items.push({ user: user.id });
    });
    
    translate.users(items, function (err, data) {
        test.ok(sl.all(data, function (item) { return item.userDescription }));
        test.done();
    })
};

exports['translate loan'] = function (test) {
    test.async();
    
    var loan;
    
    async()
    .then(function (data, next) {
        loanService.getLoans(next);
    })
    .then(function (data, next) {
        loan = data[0];
        loans = data;
        
        translate.loan(loan.id, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data, loan.code);
        test.done();
    })
    .run();
};

exports['translate loans'] = function (test) {
    test.async();
    
    var items = [];
    
    loans.forEach(function (loan) {
        items.push({ loan: loan.id });
    });
    
    translate.loans(items, function (err, data) {
        test.ok(sl.all(data, function (item) { return item.loanDescription }));
        test.done();
    })
};

