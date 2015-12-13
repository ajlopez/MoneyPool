
var ostore = require('ostore');
var async = require('simpleasync');
var dates = require('../utils/dates');
var strings = require('../utils/strings');

var noteService = require('./note');
var scoring = require('../scoring.json');

var store = ostore.createStore('loans');

function getMaxOrder(loans) {
    var maxorder = 0;
    
    loans.forEach(function (loan) {
        if (loan.order && loan.order > maxorder)
            maxorder = loan.order;
    });
    
    return maxorder;
}

function clearLoans(cb) {
    store = ostore.createStore('loans');
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
        cb(null, store.add(loan));
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
    cb(null, store.get(id));
}

function getLoansByUser(userId, cb) {
    var loans = store.find({ user: userId });

    cb(null, loans);
}

function getLoans(cb) {
    cb(null, store.find());
}

function updateLoan(id, data, cb) {
    store.update(id, data);
    cb(null, id);
}

function rejectLoan(id, cb) {
    updateLoan(id, { status: 'rejected', rejected: dates.nowString() }, cb);
}

module.exports = {
    newLoan: newLoan,
    
    getLoanById: getLoanById,
    
    getLoans: getLoans,
    getLoansByUser: getLoansByUser,
    
    updateLoan: updateLoan,
    rejectLoan: rejectLoan,
    
    clearLoans: clearLoans,
    
    newNote: newNote
};

