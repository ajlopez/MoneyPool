
"use strict"

var db = require('../../utils/db');
var loanService = require('../../services/loan');
var userService = require('../../services/user');
var noteService = require('../../services/note');
var paymentService = require('../../services/payment');
var movementService = require('../../services/movement');

var dates = require('../../utils/dates');
var async = require('simpleasync');
var sl = require('simplelists');

var loan;
var payments;

var loanId;
var adamId;
var eveId;
var abelId;

var eveNoteId;
var abelNoteId;

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['create loan user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'adam', firstName: 'Adam', lastName: 'Paradise', scoring: 'A' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        adamId = data;
        test.done();
    });
};

exports['create investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'eve', firstName: 'Eve', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        eveId = data;
        test.done();
    });
};

exports['create second investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'abel', firstName: 'Abel', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        abelId = data;
        test.done();
    });
};

exports['new loan'] = function (test) {
    test.async();
    
    loanService.newLoan({ user: adamId, amount: 1000, periods: 12, days: 30 }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['new note from first investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId.toString(), { user: eveId.toString(), amount: 600 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        eveNoteId = data;
        
        noteService.getNoteById(eveNoteId, function (err, data) {
            test.ok(!err);
            test.ok(data);
            
            test.ok(db.isNativeId(data.id));
            test.ok(db.isNativeId(data.loan));
            test.ok(db.isNativeId(data.user));
            
            test.equal(data.id.toString(), eveNoteId.toString());
            test.equal(data.loan.toString(), loanId.toString());
            test.equal(data.user.toString(), eveId.toString());
            
            test.equal(data.amount, 600);
            test.equal(data.currency, 'ARS');
            test.ok(dates.isDateTimeString(data.datetime));
            
            test.done();
        });
    });
};

exports['new note from second investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId.toString(), { user: abelId.toString(), amount: 400 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        abelNoteId = data;
        
        noteService.getNoteById(abelNoteId, function (err, data) {
            test.ok(!err);
            test.ok(data);

            test.ok(db.isNativeId(data.id));
            test.ok(db.isNativeId(data.user));
            test.ok(db.isNativeId(data.loan));
            test.equal(data.id.toString(), abelNoteId.toString());
            test.equal(data.user.toString(), abelId.toString());
            test.equal(data.loan.toString(), loanId.toString());
            
            test.equal(data.amount, 400);
            test.equal(data.currency, 'ARS');
            test.ok(dates.isDateTimeString(data.datetime));
            
            test.done();
        });
    });
};

exports['get open loans'] = function (test) {
    test.async();
    
    loanService.getOpenLoans(function (err, data) {
        test.ok(!err);
        test.ok(data);

        test.ok(data.length);
        sl.all(data, { status: 'open' });
            
        test.done();
    });
};

exports['simulate loan payments'] = function (test) {
    test.async();
    
    var today = dates.todayString();
    
    async()
    .then(function (data, next) {
        loanService.getLoanById(loanId, next);
    })
    .then(function (data, next) {
        loan = data;
        loanService.simulateLoanPayments(loanId, today, next);
    })
    .then(function (payments, next) {
        test.equal(payments.length, 12);
        
        var paymentDates = dates.calculateDates(today, loan.days, loan.periods);
        
        for (var k = 1; k <= 12; k++)
            sl.exist(payments, { loan: loanId, date: paymentDates[k - 1], order: k });
        
        test.done();
    });
}

exports['accept loan'] = function (test) {
    test.async();
    
    async()
    .then(function (data, next) {
        loanService.acceptLoan(loanId, next);
    })
    .then(function (data, next) {
        loanService.getLoanById(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data.status, 'accepted');
        test.ok(dates.isDateTimeString(data.accepted));
        test.equal(data.date, dates.removeTime(data.accepted));
        
        loan = data;

        noteService.getNotesByLoan(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.all(data, { status: 'accepted' }));

        movementService.getMovementsByUser(adamId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { credit: 1000, debit: 0, type: 'loan' }));
        
        movementService.getMovementsByUser(eveId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { debit: 600, credit: 0, type: 'note' }));
        
        movementService.getMovementsByUser(abelId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { debit: 400, credit: 0, type: 'note' }));
        
        paymentService.getPaymentsByLoan(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data.length, 12);
        
        payments = data;
        
        var paymentDates = dates.calculateDates(loan.date, loan.days, loan.periods);
        
        for (var k = 1; k <= 12; k++)
            sl.exist(data, { date: paymentDates[k - 1], order: k });
        
        test.done();
    });
};

exports['get no open loans'] = function (test) {
    test.async();
    
    loanService.getOpenLoans(function (err, data) {
        test.ok(!err);
        test.ok(data);

        test.equal(data.length, 0);
            
        test.done();
    });
};

exports['get status without movements'] = function (test) {
    test.async();
    
    async()
    .then(function (data, next) {
        loanService.getLoanStatus(loan.id, next);
    })
    .then(function (data, next) {
        test.ok(data);
        
        test.ok(data.loan);
        test.equal(data.loan.id.toString(), loan.id.toString());
        
        test.ok(data.payments);
        test.ok(Array.isArray(data.payments));
        test.equal(data.payments.length, 12);
        
        sl.all(data.payments, { canceled: 0 });
        
        test.ok(data.movements);
        test.ok(Array.isArray(data.movements));
        test.equal(data.movements.length, 0);

        test.ok(data.totals);
        test.ok(data.totals.capital);
        test.ok(data.totals.interest);

        test.ok(data.movtotals);
        test.equal(data.movtotals.credit, 0);
        test.equal(data.movtotals.debit, 0);
        test.equal(data.movtotals.interest, 0);
        test.equal(data.movtotals.capital, 0);
        
        test.done();
    });
}

exports['get status to date'] = function (test) {
    test.async();
    
    async()
    .then(function (data, next) {
        loanService.getLoanStatusToDate(loan.id, payments[0].date, next);
    })
    .then(function (data, next) {
        test.ok(data);
        
        test.ok(data.loan);
        test.equal(data.loan.id.toString(), loan.id.toString());
        
        test.ok(data.payments);
        test.ok(Array.isArray(data.payments));
        test.equal(data.payments.length, 12);
        
        sl.all(data.payments, { canceled: 0 });
        
        test.ok(data.movements);
        test.ok(Array.isArray(data.movements));
        test.equal(data.movements.length, 0);
        
        test.equal(data.lastPayment, loan.date);
        test.equal(data.dueCapital, loan.amount);
        test.equal(data.dueInterest, payments[0].interest);
        
        test.ok(data.totals);
        test.ok(data.totals.capital);
        test.ok(data.totals.interest);
        test.equal(data.totals.canceled, 0);
        
        test.done();
    });
}

