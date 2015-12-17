
var db = require('../utils/db');

var store = db.createStore('users');
var sl = require('simplelists');

function clearUsers(cb) {
    store = db.createStore('users');
    cb(null, null);
};

function newUser(user, cb) {
    store.add(user, cb);
};

function getUserById(id, cb) {
    store.get(id, cb);
}

function getUserByUsername(username, cb) {
    store.find({ username: username }, function (err, users) {
        if (err)
            return cb(err, null);
            
        if (!users || !users.length)
            cb(null, null);
        else
            cb(null, users[0]);
    });
}

function getUsers(cb) {
    store.find(cb);
}

function getUsersWithoutScoring(cb) {
    store.find(cb, function (err, data) {
        if (err)
            return cb(err, null);
        
        cb(null, sl.where(data, function (user) { return !user.scoring }));
    });
}

function getUsersWithScoring(scoring, cb) {
    store.find({ scoring: scoring }, cb);
}

function updateUser(id, data, cb) {
    store.update(id, data, cb);
}

module.exports = {
    newUser: newUser,
    
    getUserById: getUserById,
    getUserByUsername: getUserByUsername,
    
    getUsers: getUsers,
    getUsersWithoutScoring: getUsersWithoutScoring,
    getUsersWithScoring: getUsersWithScoring,
    
    updateUser: updateUser,
    
    clearUsers: clearUsers
};

