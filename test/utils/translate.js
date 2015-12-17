
var translate = require('../../utils/translate');
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');
var async = require('simpleasync');

var userService = require('../../services/user');

db.useMemory();

var statuses = require('../../data/statuses');

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
        
        translate.user(user.id, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data, user.username);
        test.done();
    })
    .run();
};

