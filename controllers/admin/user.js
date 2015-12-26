
var async = require('simpleasync');

var userService = require('../../services/user');
var loanService = require('../../services/loan');
var translate = require('../../utils/translate');
var scorings = require('../../data/scorings');

var userdata = require('../../data/userdata.json');

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
    .error(function (err) {
        res.render('admin/error', { error: err });
    });
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
        
        model.scorings = [];
        
        model.userdata = userdata;
        
        for (var scoring in scorings)
            model.scorings.push(scoring);

        res.render('admin/userView', model);
    })
    .error(function (err) {
        res.render('admin/error', { error: err });
    });
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

function qualifyUser(req, res) {
    var id = req.params.id;
    
    if (id.length && id.length < 6)
        id = parseInt(id);
    
    var scoring = req.params.scoring;
    
    userService.qualifyUser(id, scoring, function (err, data) {
        if (err)
            return res.render('admin/error', { error: err });
            
        res.redirect('/admin/user/' + id);        
    });
}

module.exports = {
    listUsers: listUsers,
    viewUser: viewUser,
    newUser: newUser,
    qualifyUser: qualifyUser
};

