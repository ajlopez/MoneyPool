
var async = require('simpleasync');

var loanService = require('../../services/loan');
var translate = require('../../utils/translate');

function listLoans(req, res) {
    var model = { }
    async()
    .then(function (data, next) {
        loanService.getLoans(next);
    })
    .then(function (data, next) {
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

