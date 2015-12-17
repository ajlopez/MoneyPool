
var userService = require('../services/user');

function registerUser(req, res) {
    res.render('user/register', {});
}

function loginUser(req, res) {
    res.render('user/login', { message: null });
}

function authenticateUser(req, res) {
    console.dir(req.body);
    
    if (!req.body.username || req.body.username.trim() === '')
        return res.render('user/login', { message: 'Código de Usuario requerido' });
        
    userService.getUserByUsername(req.body.username, function (err, user) {
        if (err)
            return res.render('error', { error: err });
        
        if (!user) {
            req.body.message = 'Usuario inexistente';
            return res.render('user/login', req.body);
        }
        
        return res.redirect('/');
    });
}

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser,
    authenticateUser: authenticateUser
};

