
var finances = require('../../utils/finances');

exports['calculate payments without rate'] = function (test) {
    var payments = finances.calculatePayments(1000, 0, 30, 10);
    
    test.ok(payments);
    test.ok(Array.isArray(payments));
    test.equal(payments.length, 10);
    
    for (var k = 0; k < 10; k++) {
        test.equal(payments[k].capital, 100);
        test.equal(payments[k].interest, 0);
    }
};

exports['calculate payments with rate'] = function (test) {
    var payments = finances.calculatePayments(1000, 1, 30, 10);
    
    test.ok(payments);
    test.ok(Array.isArray(payments));
    test.equal(payments.length, 10);
    
    for (var k = 0; k < 10; k++) {
        test.equal(payments[k].capital, 100);
        test.ok(payments[k].interest > 0);
        
        if (k)
            test.ok(payments[k].interest < payments[k - 1].interest);
    }
    
    test.equal(finances.calculateInterest(1000, 1, 30), payments[0].interest);
};