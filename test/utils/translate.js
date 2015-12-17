
var translate = require('../../utils/translate');
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');
var async = require('simpleasync');
var sl = require('simplelists');

var userService = require('../../services/user');

db.useMemory();

var statuses = require('../../data/statuses');
var scorings = require('../../data/scorings');

var users;

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
    for (var key in statuses) {
        test.equal(translate.status(key), statuses[key].description);
    }
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

