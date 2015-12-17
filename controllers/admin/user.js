
var async = require('simpleasync');

var userService = require('../../services/user');
var translate = require('../../utils/translate');

function listUsers(req, res) {
    var model = { }
    async()
    .then(function (data, next) {
        userService.getUsers(next);
    })
    .then(function (data, next) {
        model.users = data;
        res.render('admin/userList', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

function viewUser(req, res) {
    userService.getUserById(req.params.id, function (err, user) {
        if (err)
            return res.render('admin/error', { error: err });
        
        user.scoringDescription = translate.scoring(user.scoring);
        
        res.render('admin/userView', { user: user });
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

module.exports = {
    listUsers: listUsers,
    viewUser: viewUser,
    newUser: newUser
};

