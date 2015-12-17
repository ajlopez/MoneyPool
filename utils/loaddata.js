
var path = require('path');
var each = require('./each');
var async = require('simpleasync');

var userService = require('../services/user');

var data;

function loaddata(filename, cb) {
    if (!filename)
        filename = path.join(__dirname, '..', 'data', 'data.json');
        
    data = require(filename);
 
    async()
    .then(function (d, next) {
        each(data.users, processUser, cb);
    })
    .run();
}

function processUser(user, next) {
    userService.newUser(user, next);
}

module.exports = loaddata;
