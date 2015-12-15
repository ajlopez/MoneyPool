
var each = require('../../utils/each');

exports['apply to array'] = function (test) {
    test.async();
    
    var total = 0;
    
    each([1, 2, 3], function (item, next) {
        total += item;
        next();
    }, function (err, data) {
        test.ok(!err);
        test.equal(data, null);
        test.equal(total, 6);
        test.done();
    });
};

exports['process error'] = function (test) {
    test.async();
    
    var total = 0;
    
    each([1, 2, 3], function (item, next) {
        if (item == 2)
            throw new Error("Invalid number");
        total += item;
        next();
    }, function (err, data) {
        test.ok(err);
        test.equal(err.toString(), "Error: Invalid number");
        test.ok(!data);
        test.done();
    });
};

exports['process error using next'] = function (test) {
    test.async();
    
    var total = 0;
    
    each([1, 2, 3], function (item, next) {
        if (item == 2)
            return next(new Error("Invalid number"));
        total += item;
        next();
    }, function (err, data) {
        test.ok(err);
        test.equal(err.toString(), "Error: Invalid number");
        test.ok(!data);
        test.done();
    });
};

