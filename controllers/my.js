
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

module.exports = {
    viewMyUser: viewMyUser,
    listMyLoans: listMyLoans
};
