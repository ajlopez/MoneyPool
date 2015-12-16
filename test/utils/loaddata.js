
var loaddata = require('../../utils/loaddata');
var db = require('../../utils/db');

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

