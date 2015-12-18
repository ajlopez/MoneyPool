
var async = require('simpleasync');
var sl = require('simplelists');

var loanService = require('../../services/loan');
var noteService = require('../../services/note');
var movementService = require('../../services/movement');
var translate = require('../../utils/translate');
var dates = require('../../utils/dates');

function listLoans(req, res) {
    var model = { }
    async()
    .then(function (data, next) {
        loanService.getLoans(next);
    })
    .then(function (data, next) {
        data = sl.sort(data, 'datetime');
        model.loans = data;
        translate.statuses(model.loans);
        translate.users(model.loans, next);
    })
    .then(function (data, next) {
        res.render('admin/loanList', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

function viewLoan(req, res) {
    var model = { };
    var id = req.params.id;
    
    if (id.length && id.length < 6)
        id = parseInt(id);
    
    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (loan, next) {
        loan.statusDescription = translate.status(loan.status);
        model.loan = loan;
        translate.user(model.loan.user, next);
    })
    .then(function (data, next) {
        model.loan.userDescription = data;
                
        if (model.loan.status != 'accepted')
            return next(null, null);
            
        loanService.getLoanStatusToDate(id, dates.todayString(), next);
    })
    .then(function (status, next) {
        model.status = status;
                
        if (model.loan.status != 'open')
            return next(null, null);
            
        loanService.simulateLoanPayments(id, dates.todayString(), next);
    })
    .then(function (payments, next) {
        model.payments = payments;
        
        noteService.getNotesByLoan(id, next);
    })
    .then(function (notes, next) {
        model.notes = notes;
        
        if (notes)
            model.totalNotes = sl.sum(notes, ['amount']).amount;
        
        if (!notes)
            return next(null, null);

        translate.statuses(notes);
        translate.users(notes, next);
    })
    .then(function (notes, next) {
        movementService.getMovementsByLoan(id, next);
    })
    .then(function (movements, next) {
        model.movements = movements;
        sl.sort(movements, 'datetime');
        translate.users(movements, next);
    })
    .then(function (notes, next) {
        res.render('admin/loanView', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

function newLoan(req, res) {
    loanService.newLoan(req.body, function (err, id) {
        if (err)
            return res.render('admin/error', { error: err });
            
        loanService.getLoanById(id, function (err, loan) {
            if (err)
                return res.render('admin/error', { error: err });
                       
            res.render('admin/loanView', { loan: loan });
        });
    });
}

module.exports = {
    listLoans: listLoans,
    viewLoan: viewLoan,
    newLoan: newLoan
};

