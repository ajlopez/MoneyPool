
var userService = require('../services/user');

var async = require('simpleasync');

var userdata = require('../data/userdata.json');
var genres = require('../data/genres.json');
var activities = require('../data/activities.json');
var years = {};

for (var year = 1915; year < 2016; year++)
    years[year] = { description: year };

function getCurrentUserId(req) {
    var id = req.session.user.id;

    if (id.length && id.length < 6)
        id = parseInt(id);
        
    return id;
}

function registerUser(req, res) {
    res.render('user/register', { message: null });
}

function createUser(req, res) {
    async()
    .then(function (data, next) {
        req.body.isAdmin = false;
        userService.newUser(req.body, next);
    })
    .then(function (id, next) {
        userService.getUserById(id, next);
    })
    .then(function (user, next) {
        req.session.user = user;
        res.redirect('/user/data');
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();    
}

function updateUser(req, res) {
    async()
    .then(function (data, next) {
        delete req.body.isAdmin;
        userService.updateUser(getCurrentUserId(req), req.body, next);
    })
    .then(function (user, next) {
        res.redirect('/my');
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();    
}

function dataUser(req, res) {
    var model = { 
        userdata: userdata,
        message: null,
        values: {
            years: years,
            genres: genres,
            activities: activities
        }
    };
    
    res.render('user/data', model);
}

function loginUser(req, res) {
    res.render('user/login', { message: null });
}

function logoutUser(req, res) {
    req.session.user = null;
    res.redirect('/');
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
        
        req.session.user = user;
        
        return res.redirect('/');
    });
}

module.exports = {
    registerUser: registerUser,
    createUser: createUser,
    
    dataUser: dataUser,
    updateUser: updateUser,
    
    loginUser: loginUser,
    logoutUser: logoutUser,
    
    authenticateUser: authenticateUser
};

