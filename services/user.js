
var ostore = require('ostore');

var store = ostore.createStore('users');

function addUser(user, cb) {
    cb(null, store.add(user));
};

function getUserById(id, cb) {
    cb(null, store.get(id));
}

function getUserByUsername(username, cb) {
    var users = store.find({ username: username });

    if (!users || !users.length)
        cb(null, null);
    else
        cb(null, users[0]);
}

function getUsers(cb) {
    cb(null, store.find());
}

function updateUser(id, data, cb) {
    store.update(id, data);
    cb(null, id);
}

module.exports = {
    addUser: addUser,
    
    getUserById: getUserById,
    getUserByUsername: getUserByUsername,
    
    getUsers: getUsers,
    
    updateUser: updateUser
};

