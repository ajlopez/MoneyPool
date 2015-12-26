
var path = require('path');
var each = require('./each');
var async = require('simpleasync');
var sl = require('simplelists');

var userService = require('../services/user');
var loanService = require('../services/loan');

var data;
var users;

function loaddata(filename, cb) {
    if (!filename)
        filename = path.join(__dirname, '..', 'data', 'data.json');
        
    data = require(filename);
 
    async()
    .then(function (d, next) {
        each(data.users, processUser, next);
    })
    .then(function (d, next) {
        userService.getUsers(next);
    })
    .then(function (d, next) {
        users = d;
        each(data.loans, processLoan, cb);
    });
}

function processUser(user, next) {
    userService.newUser(user, next);
}

function processLoan(loan, next) {
    loan.user = sl.first(users, loan.user).id;
    loanService.newLoan(loan, next);
}

module.exports = loaddata;

