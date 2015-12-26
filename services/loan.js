"use strict"

var db = require('../utils/db');
var async = require('simpleasync');
var sl = require('simplelists');
var dates = require('../utils/dates');
var finances = require('../utils/finances');
var strings = require('../utils/strings');
var each = require('../utils/each');

var noteService = require('./note');
var movementService = require('./movement');
var paymentService = require('./payment');
var scorings = require('../data/scorings.json');

function getMaxOrder(loans) {
    var maxorder = 0;
    
    loans.forEach(function (loan) {
        if (loan.order && loan.order > maxorder)
            maxorder = loan.order;
    });
    
    return maxorder;
}

function clearLoans(cb) {
    db.createStore('loans').clear(cb);
};

function newLoan(loan, cb) {
    var store = db.store('loans');
    
    if (!loan.status)
        loan.status = 'open';
    if (!loan.currency)
        loan.currency = 'ARS';
    if (!loan.periods)
        loan.periods = 12;
    if (!loan.days)
        loan.days = 30;
    if (!loan.created)
        loan.created = dates.nowString();
    if (loan.user)
        loan.user = db.toId(loan.user);
        
    var uservice = require('./user');
    var user;
    var uloans;
    
    async()
    .then(function (data, next) {
        uservice.getUserById(loan.user, next);
    })
    .then(function (data, next) {
        user = data;
        
        if (user.scoring) {
            if (!loan.scoring)
                loan.scoring = user.scoring;
            if (!loan.monthlyRate)
                loan.monthlyRate = scorings[user.scoring].monthlyRate;
        }
        
        getLoansByUser(loan.user, next);
    })
    .then(function (data, next) {
        uloans = data;
        getLoansByUser(loan.user, next);
    })
    .then(function (data, next) {
        var maxorder = getMaxOrder(data);
        loan.order = maxorder + 1;
        loan.code = user.username + '-' + strings.fillZeroes(loan.order, 4);
        store.add(loan, cb);
    });
    
};

function newNote(loanId, note, cb) {
    loanId = db.toId(loanId);
    
    var store = db.store('loans');
    
    var loan;
    
    note.loan = loanId;
    
    if (note.user)
        note.user = db.toId(note.user);
    
    async()
    .then(function (data, next) {
        getLoanById(loanId, next);
    })
    .then(function (data, next) {
        loan = data;
        
        note.currency = loan.currency;
        
        noteService.newNote(note, next);
    })
    .then(function (data, next) {
        cb(null, data);
    });
};

function getLoanById(id, cb) {
    var store = db.store('loans');
    
    store.get(id, cb);
}

function getLoansByUser(userId, cb) {
    var store = db.store('loans');
    
    store.find({ user: db.toId(userId) }, cb);
}

function getLoans(cb) {
    var store = db.store('loans');
    
    store.find(cb);
}

function getOpenLoans(cb) {
    var store = db.store('loans');
    
    store.find({ status: 'open' }, cb);
}

function updateLoan(id, data, cb) {
    var store = db.store('loans');
    
    store.update(id, data, cb);
}

function rejectLoan(id, cb) {
    id = db.toId(id);
    
    updateLoan(id, { status: 'rejected', rejected: dates.nowString() }, cb);
}

function simulateLoanPayments(id, today, cb) {
    id = db.toId(id);
    
    var loan;
    var pays;
    var pdates;
    
    async()
    .then(function (data, next) {
        getLoanById(id, next);
    })
    .then(function (loan, next) {
        var k = 0;
        var pays = finances.calculatePayments(loan.amount, loan.monthlyRate, loan.days, loan.periods);
        var pdates = dates.calculateDates(today, loan.days, loan.periods);
        
        var payments = [];
        
        pays.forEach(function (pay) {
            var pdate = pdates[k++];
            payments.push({ loan: loan.id, date: pdate, capital: pay.capital, interest: pay.interest, order: k });
        });
        
        cb(null, payments);
    })
    .error(function (err) {
        cb(err, null);
    });
}

function acceptLoan(id, cb) {
    id = db.toId(id);
    
    var loan;
    var notes;
    var totalNotes;
    var pays;
    var pdates;
    var accepted = dates.nowString();
    
    async()
    .then(function (data, next) {
        noteService.getNotesByLoan(id, next);
    })
    .then(function (data, next) {
        notes = sl.where(data, { status: 'open' });
        totalNotes = sl.sum(notes, ['amount']).amount;
        getLoanById(id, next);
    })
    .then(function (data, next) {
        loan = data;
        loan.amount = totalNotes;
        updateLoan(id, { status: 'accepted', amount: totalNotes, accepted: accepted, date: dates.removeTime(accepted) }, next);
    })
    .then(function (data, next) {
        noteService.updateNote({ loan: id, status: 'open' }, { status: 'accepted' }, next);
    })
    .then(function (data, next) {
        movementService.newMovement({
            user: loan.user,
            credit: loan.amount,
            debit: 0,
            type: 'loan',
            currency: loan.currency,
            loan: id
        }, next);
    })
    .then(function (data, next) {
        each(notes, function (note, next) {
            movementService.newMovement({
                user: note.user,
                debit: note.amount,
                credit: 0,
                type: 'note',
                currency: note.currency,
                loan: note.loan
            }, next);
        }, next);
    })
    .then(function (data, next) {
        var k = 0;
        var pays = finances.calculatePayments(loan.amount, loan.monthlyRate, loan.days, loan.periods);
        var pdates = dates.calculateDates(dates.removeTime(accepted), loan.days, loan.periods);
        
        each(pays, function (pay, next) {
            var pdate = pdates[k++];
            
            paymentService.newPayment({ loan: loan.id, date: pdate, capital: pay.capital, interest: pay.interest, order: k }, next)
        }, cb);
    });
}

function getLoanStatus(id, cb) {
    id = db.toId(id);
    
    var status = { };
    
    async()
    .then(function (data, next) {
        getLoanById(id, next);
    })
    .then(function (data, next) {
        status.loan = data;
        
        paymentService.getPaymentsByLoan(id, next);
    })
    .then(function (data, next) {
        status.payments = sl.sort(data, 'order');
        
        var totals = sl.sum(data, ['capital', 'interest']);

        status.totals = totals;
        
        movementService.getMovementsByLoan(id, next);
    })
    .then(function (data, next) {
        data = sl.where(data, { type: 'payment' });
        var totals = sl.sum(data, ['capital', 'interest', 'debit', 'credit']);
        status.movements = sl.sort(data, 'datetime');
        status.movtotals = totals;
        
        cb(null, status);
    });
}

function getLoanStatusToDate(id, date, cb) {
    id = db.toId(id);
    
    var status;
    
    async()
    .then(function (data, next) {
        getLoanStatus(id, next);
    })
    .then(function (data, next) {
        status = data;
        
        status.payments.forEach(function (payment) {
            payment.canceled = 0;
        });
        
        var paidCapital = 0;
        
        var lastDate = status.loan.date;
        
        for (var k = 0; k < status.movements.length; k++) {            
            var mdate = dates.removeTime(status.movements[k].datetime);
            
            if (mdate > date)
                continue;
            
            var capital = status.movements[k].capital;
            
            status.payments.forEach(function (payment) {
                if (capital <= 0)
                    return;
                
                var due = payment.capital - payment.canceled;
                var amount;
                
                if (due < capital)
                    amount = due;
                else
                    amount = capital;
                
                payment.canceled += amount;
                capital -= amount;
            })
            
            paidCapital += status.movements[k].capital;
            lastDate = mdate;
        }
        
        var totals = sl.sum(status.payments, ['canceled']);
        
        status.totals.canceled = totals.canceled;
            
        status.dueCapital = status.loan.amount - paidCapital;
        status.lastPayment = lastDate;
        
        status.dueInterest = finances.calculateInterest(status.dueCapital, status.loan.monthlyRate, dates.getDateDiffDays(lastDate, date));
        
        cb(null, status);
    });
}

function doPayment(loanId, movdata, cb) {
    loanId = db.toId(loanId);
    
    if (!movdata.datetime)
        movdata.datetime = dates.nowString();
    
    var date = dates.removeTime(movdata.datetime);
    var status;
    var amount;
    
    async()
    .then(function (data, next) {
        getLoanStatusToDate(loanId, date, next);
    })
    .then(function (data, next) {
        status = data;
        amount = movdata.amount;
        var interest = status.dueInterest;
        var capital = amount - interest;
        
        var movement = {
            user: status.loan.user,
            loan: loanId,
            currency: status.loan.currency,
            debit: amount,
            credit: 0,
            capital: capital,
            interest: interest,
            type: 'payment',
            datetime: movdata.datetime
        };
        
        movementService.newMovement(movement, next);
    })
    .then(function (data, next) {
        movementService.getMovementsByLoan(loanId, next);
    })
    .then(function (data, next) {
        each(data, function (mov, next) {
            if (mov.type != 'note')
                return next();
            
            var movement = {
                debit: 0,
                credit: amount * mov.debit / status.loan.amount,
                user: mov.user,
                loan: loanId,
                currency: status.loan.currency,
                type: 'return'
            };
            
            movementService.newMovement(movement, next);
        }, cb);
    });
}

module.exports = {
    newLoan: newLoan,
    
    getLoanById: getLoanById,
    
    getLoans: getLoans,
    getOpenLoans: getOpenLoans,
    getLoansByUser: getLoansByUser,
    simulateLoanPayments: simulateLoanPayments,
    
    updateLoan: updateLoan,
    rejectLoan: rejectLoan,
    acceptLoan: acceptLoan,
    
    clearLoans: clearLoans,
    
    newNote: newNote,
    
    getLoanStatus: getLoanStatus,
    getLoanStatusToDate: getLoanStatusToDate,
    
    doPayment: doPayment
};

