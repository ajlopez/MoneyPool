
var userService = require('../../services/user');

function listUsers(req, res) {
    userService.getUsers(function (err, users) {
        if (err)
            return res.render('admin/error', { error: err });
            
        res.render('admin/userList', { users: users });
    });
}

function addUser(req, res) {
    userService.addUser(req.body, function (err, id) {
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
    addUser: addUser
};

