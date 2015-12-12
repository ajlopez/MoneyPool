
var loanService = require('../../services/loan');
var dates = require('../../utils/dates');
var async = require('simpleasync');

var loanId;

exports['clear loans'] = function (test) {
    test.async();
    
    loanService.clearLoans(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['add loan'] = function (test) {
    test.async();
    
    loanService.addLoan({ user: 1, amount: 1000 }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['get loan by id'] = function (test) {
    test.async();
    
    loanService.getLoanById(loanId, function (err, loan) {
        test.ok(!err);
        test.ok(loan);
        test.equal(typeof loan, 'object');
        
        test.equal(loan.user, 1);
        test.equal(loan.id, loanId);
        test.equal(loan.status, 'open');
        test.equal(loan.currency, 'ARS');
        test.ok(dates.isDateTimeString(loan.created));
        
        test.done();
    });
};

exports['get unknown loan by id'] = function (test) {
    test.async();
    
    loanService.getLoanById(0, function (err, loan) {
        test.ok(!err);
        test.strictEqual(loan, null);
        
        test.done();
    });
};

exports['get loans by user'] = function (test) {
    test.async();
    
    loanService.getLoansByUser(1, function (err, loans) {
        test.ok(!err);
        test.ok(loans);
        test.ok(Array.isArray(loans));
        test.equal(loans.length, 1);
        
        test.equal(loans[0].user, 1);
        test.equal(loans[0].id, loanId);
        
        test.done();
    });
};

exports['get loan by unknown user'] = function (test) {
    test.async();
    
    loanService.getLoansByUser(0, function (err, loans) {
        test.ok(!err);
        test.ok(loans);
        test.ok(Array.isArray(loans));
        test.equal(loans.length, 0);
        
        test.done();
    });
};

exports['get loans'] = function (test) {
    test.async();
    
    loanService.getLoans(function (err, loans) {
        test.ok(!err);
        test.ok(loans);
        test.ok(Array.isArray(loans));
        test.equal(loans.length, 1);
        
        test.equal(loans[0].user, 1);
        test.equal(loans[0].id, loanId);
        
        test.done();
    });
};

exports['update loan data'] = function (test) {
    test.async();
    
    loanService.updateLoan(loanId, { name: 'A loan' }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        test.equal(id, loanId);
        
        loanService.getLoanById(loanId, function (err, loan) {
            test.ok(!err);
            test.ok(loan);
            test.equal(loan.id, loanId);
            test.equal(loan.name, 'A loan');
            test.equal(loan.user, 1);
            
            test.done();
        });
    });
};

exports['add and reject loan'] = function (test) {
    test.async();
    
    var loanId;
    
    async()
    .then(function (data, next) {
        loanService.addLoan({ user: 1, amount: 1000 }, next);
    })
    .then(function (id, next) {
        loanId = id;
        
        loanService.rejectLoan(loanId, next);
    })
    .then(function (data, next) {
        loanService.getLoanById(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data.id, loanId);
        test.equal(data.status, 'rejected');
        test.ok(dates.isDateTimeString(data.rejected));
        test.done();
    })
    .run();
};