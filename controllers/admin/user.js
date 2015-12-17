
var async = require('simpleasync');

var userService = require('../../services/user');
var loanService = require('../../services/loan');
var translate = require('../../utils/translate');

function listUsers(req, res) {
    var model = { }
    async()
    .then(function (data, next) {
        userService.getUsers(next);
    })
    .then(function (data, next) {
        model.users = data;
        translate.scorings(model.users);
        res.render('admin/userList', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

function viewUser(req, res) {
    var model = { };
    var id = req.params.id;
    
    if (id.length && id.length < 6)
        id = parseInt(id);
    
    async()
    .then(function (data, next) {
        userService.getUserById(id, next);
    })
    .then(function (user, next) {
        user.scoringDescription = translate.scoring(user.scoring);
        model.user = user;
        loanService.getLoansByUser(id, next);
    })
    .then(function (loans, next) {
        translate.statuses(loans);

        model.loans = loans;

        res.render('admin/userView', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

function newUser(req, res) {
    userService.newUser(req.body, function (err, id) {
        if (err)
            return res.render('admin/error', { error: err });
            
        userService.getUserById(id, function (err, user) {
            if (err)
                return res.render('admin/error', { error: err });
                
            res.render('admin/userView', { user: user });
        });
    });
}

module.exports = {
    listUsers: listUsers,
    viewUser: viewUser,
    newUser: newUser
};

