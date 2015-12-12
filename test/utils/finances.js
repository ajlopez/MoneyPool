
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