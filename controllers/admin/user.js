
var userService = require('../../services/user');

function getUsers(req, res) {
    userService.getUsers(function (err, users) {
        if (err)
            return res.render('error', { error: err });
            
        res.render('userList', { users: users });
    });
}

function addUser(req, res) {
    userService.addUser(req.body, function (err, id) {
        if (err)
            return res.render('error', { error: err });
            
        userService.getUserById(id, function (err, user) {
            if (err)
                return res.render('error', { error: err });
                
            res.render('userView', { user: user });
        });
    });
}

module.exports = {
    getUsers: getUsers,
    addUser: addUser
};