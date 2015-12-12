
var userService = require('../../services/user');

function getUsers(req, res) {
    res.render('userList', []);
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