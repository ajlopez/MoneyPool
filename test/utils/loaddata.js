
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');

db.useMemory();

var userService = require('../../services/user');

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

