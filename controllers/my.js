
var async = require('simpleasync');

var userService = require('../services/user');
var loanService = require('../services/loan');
var translate = require('../utils/translate');

function getCurrentUserId(req) {
    var id = req.session.user.id;

    if (id.length && id.length < 6)
        id = parseInt(id);
        
    return id;
}

function getId(req) {
    var id = req.params.id;

    if (id.length && id.length < 6)
        id = parseInt(id);
        
    return id;
}

function viewMyUser(req, res) {
    var model = { };
    
    var id = getCurrentUserId(req);
        
    async()
    .then(function (data, next) {
        userService.getUserById(id, next);
    })
    .then(function (user, next) {
        user.scoringDescription = translate.scoring(user.scoring);
        model.user = user;

        res.render('my/userView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function listMyLoans(req, res) {
    var model = { };
    
    var id = getCurrentUserId(req);
        
    async()
    .then(function (data, next) {
        loanService.getLoansByUser(id, next);
    })
    .then(function (loans, next) {
        translate.statuses(loans);

        model.loans = loans;

        res.render('my/loanList', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function newMyLoan(req, res) {
    var model = { };

    res.render('my/loanNew', model);
}

function createMyLoan(req, res) {
    var loan = { };
    
    loan.amount = parseFloat(req.body.amount);
    loan.periods = parseInt(req.body.periods);
    loan.user = getCurrentUserId(req);

    async()
    .then(function (data, next) {
        loanService.newLoan(loan, next);
    })
    .then(function (data, next) {
        res.redirect('/my/loan');
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function viewMyLoan(req, res) {
    var id = getId(req);

    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (loan, next) {
        if (!loan || loan.user != getCurrentUserId(req))
            return res.redirect('/my');
        
        var model = {
            loan: loan
        };
        
        res.render('my/loanView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

module.exports = {
    viewMyUser: viewMyUser,
    listMyLoans: listMyLoans,
    viewMyLoan: viewMyLoan,
    newMyLoan: newMyLoan,
    createMyLoan: createMyLoan
};
