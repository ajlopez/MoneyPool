
var db = require('../utils/db');
var async = require('simpleasync');
var dates = require('../utils/dates');
var finances = require('../utils/finances');
var strings = require('../utils/strings');
var each = require('../utils/each');

var noteService = require('./note');
var movementService = require('./movement');
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
    
    async()
    .then(function (data, next) {
        getLoanById(id, next);
    })
    .then(function (data, next) {
        loan = data;
        updateLoan(id, { status: 'accepted', accepted: dates.nowString() }, next);
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
        var pdates = dates.calculatePayments(dates.toDate(loan.accepted), loan.days, loan.periods);
        
        each(pays, function (pay, next) {
            var pdate = pdates[k++];
            
            paymentService.newPayment({ loan: loan.id, date: pdate, capital: pay.capital, interest: pay.interest, order: k }, next)
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
    
    newNote: newNote
};

