
"strict equal"

var db = require('../utils/db');

var sl = require('simplelists');

function clearUsers(cb) {
    db.createStore('users').clear(cb);
};

function newUser(user, cb) {
    var store = db.store('users');
    store.add(user, cb);
};

function getUserById(id, cb) {
    var store = db.store('users');
    store.get(id, cb);
}

function getUserByUsername(username, cb) {
    var store = db.store('users');
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
    var store = db.store('users');
    store.find(cb);
}

function getUsersWithoutScoring(cb) {
    var store = db.store('users');
    store.find(cb, function (err, data) {
        if (err)
            return cb(err, null);
        
        cb(null, sl.where(data, function (user) { return !user.scoring }));
    });
}

function getUsersWithScoring(scoring, cb) {
    var store = db.store('users');
    store.find({ scoring: scoring }, cb);
}

function updateUser(id, data, cb) {
    var store = db.store('users');
    store.update(id, data, cb);
}

function qualifyUser(id, scoring, cb) {
    updateUser(id, { scoring: scoring }, cb);
}

module.exports = {
    newUser: newUser,
    
    getUserById: getUserById,
    getUserByUsername: getUserByUsername,
    
    getUsers: getUsers,
    getUsersWithoutScoring: getUsersWithoutScoring,
    getUsersWithScoring: getUsersWithScoring,
    
    updateUser: updateUser,
    
    clearUsers: clearUsers,
    
    qualifyUser: qualifyUser
};

