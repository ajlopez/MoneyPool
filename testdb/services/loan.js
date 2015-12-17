
"use strict"

var tests = require('../../test/services/loan');
var db = require('../../utils/db');

exports['use db'] = function (test) {
    test.async();

    db.useDb('liqueed-test', null, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.done();
    });
}

for (var key in tests)
    exports[key] = tests[key];
    
exports['close db'] = function (test) {
    test.async();

    db.closeDb(function (err, data) {
        test.ok(!err);
        test.ok(!data);
        test.done();
    });
}
  
