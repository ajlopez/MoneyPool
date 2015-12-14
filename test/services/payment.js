
var paymentService = require('../../services/payment');
var dates = require('../../utils/dates');
var async = require('simpleasync');

var paymentId;

exports['clear payments'] = function (test) {
    test.async();
    
    paymentService.clearPayments(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['new payment'] = function (test) {
    test.async();
    
    paymentService.newPayment({ loan: 1, order: 2, capital: 1000, interest: 100, date: "2015-12-12" }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        paymentId = id;
        test.done();
    });
};

exports['get payment by id'] = function (test) {
    test.async();
    
    paymentService.getPaymentById(paymentId, function (err, payment) {
        test.ok(!err);
        test.ok(payment);
        test.equal(typeof payment, 'object');
        
        test.equal(payment.loan, 1);
        test.equal(payment.capital, 1000);
        test.equal(payment.interest, 100);
        test.equal(payment.order, 2);
        test.equal(payment.id, paymentId);
        test.ok(dates.isDateString(payment.date));
        test.equal(payment.date, "2015-12-12");
        
        test.done();
    });
};

exports['get unknown payment by id'] = function (test) {
    test.async();
    
    paymentService.getPaymentById(0, function (err, payment) {
        test.ok(!err);
        test.strictEqual(payment, null);
        
        test.done();
    });
};

exports['get payments by loan'] = function (test) {
    test.async();
    
    paymentService.getPaymentsByLoan(1, function (err, payments) {
        test.ok(!err);
        test.ok(payments);
        test.ok(Array.isArray(payments));
        test.equal(payments.length, 1);
        
        test.equal(payments[0].loan, 1);
        test.equal(payments[0].id, paymentId);
        
        test.done();
    });
};

exports['get payment by unknown loan'] = function (test) {
    test.async();
    
    paymentService.getPaymentsByLoan(0, function (err, payments) {
        test.ok(!err);
        test.ok(payments);
        test.ok(Array.isArray(payments));
        test.equal(payments.length, 0);
        
        test.done();
    });
};

exports['get payments'] = function (test) {
    test.async();
    
    paymentService.getPayments(function (err, payments) {
        test.ok(!err);
        test.ok(payments);
        test.ok(Array.isArray(payments));
        test.equal(payments.length, 1);
        
        test.equal(payments[0].loan, 1);
        test.equal(payments[0].id, paymentId);
        
        test.done();
    });
};

exports['update payment data'] = function (test) {
    test.async();
    
    paymentService.updatePayment(paymentId, { description: 'A payment' }, function (err, data) {
        test.ok(!err);
        
        paymentService.getPaymentById(paymentId, function (err, payment) {
            test.ok(!err);
            test.ok(payment);
            test.equal(payment.id, paymentId);
            test.equal(payment.description, 'A payment');
            test.equal(payment.loan, 1);
            
            test.done();
        });
    });
};

