
var userService = require('../services/user');

function registerUser(req, res) {
    res.render('user/register', {});
}

function loginUser(req, res) {
    res.render('user/login', {});
}

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser
};

