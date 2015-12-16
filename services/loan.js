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
var scoring = require('../scoring.json');

var store = db.createStore('loans');

function getMaxOrder(loans) {
    var maxorder = 0;
    
    loans.forEach(function (loan) {
        if (loan.order && loan.order > maxorder)
            maxorder = loan.order;
    });
    
    return maxorder;
}

function clearLoans(cb) {
    store = db.createStore('loans');
    cb(null, null);
};

function newLoan(loan, cb) {
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
            loan.scoring = user.scoring;
            loan.monthlyRate = scoring[user.scoring].monthlyRate;
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
    })
    .run();
    
};

function newNote(loanId, note, cb) {
    var loan;
    
    note.loan = loanId;
    
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
    })
    .run();
};

function getLoanById(id, cb) {
    store.get(id, cb);
}

function getLoansByUser(userId, cb) {
    store.find({ user: userId }, cb);
}

function getLoans(cb) {
    store.find(cb);
}

function updateLoan(id, data, cb) {
    store.update(id, data, cb);
}

function rejectLoan(id, cb) {
    updateLoan(id, { status: 'rejected', rejected: dates.nowString() }, cb);
}

function acceptLoan(id, cb) {
    var loan;
    var pays;
    var pdates;
    var accepted = dates.nowString();
    
    async()
    .then(function (data, next) {
        getLoanById(id, next);
    })
    .then(function (data, next) {
        loan = data;
        updateLoan(id, { status: 'accepted', accepted: accepted, date: dates.removeTime(accepted) }, next);
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
        noteService.getNotesByLoan(id, next);
    })
    .then(function (data, next) {
        each(data, function (note, next) {
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
    })
    .run();
}

function getLoanStatus(id, cb) {
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
        
        movementService.getMovementsByLoan(id, next);
    })
    .then(function (data, next) {
        data = sl.where(data, { type: 'payment' });
        status.movements = sl.sort(data, 'datetime');
        
        cb(null, status);
    })
    .run();
}

function getLoanStatusToDate(id, date, cb) {
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
            
        status.dueCapital = status.loan.amount - paidCapital;
        status.lastPayment = lastDate;
        
        status.dueInterest = finances.calculateInterest(status.dueCapital, status.loan.monthlyRate, dates.getDateDiffDays(lastDate, date));
        
        cb(null, status);
    })
    .run();
}

function doPayment(loanId, movdata, cb) {
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
            amount: amount,
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
    })
    .run();
}

module.exports = {
    newLoan: newLoan,
    
    getLoanById: getLoanById,
    
    getLoans: getLoans,
    getLoansByUser: getLoansByUser,
    
    updateLoan: updateLoan,
    rejectLoan: rejectLoan,
    acceptLoan: acceptLoan,
    
    clearLoans: clearLoans,
    
    newNote: newNote,
    
    getLoanStatus: getLoanStatus,
    getLoanStatusToDate: getLoanStatusToDate,
    
    doPayment: doPayment
};

