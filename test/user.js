
var userService = require('../services/user');

var adamId;

exports['add user'] = function (test) {
    test.async();
    
    userService.addUser({ username: 'adam', name: 'Adam' }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        adamId = id;
        test.done();
    });
};

exports['get user by id'] = function (test) {
    test.async();
    
    userService.getUserById(adamId, function (err, user) {
        test.ok(!err);
        test.ok(user);
        test.equal(typeof user, 'object');
        
        test.ok(user.name);
        test.equal(user.username, 'adam');
        test.equal(user.name, 'Adam');
        test.equal(user.id, adamId);
        
        test.done();
    });
};

exports['get users'] = function (test) {
    test.async();
    
    userService.getUsers(function (err, users) {
        test.ok(!err);
        test.ok(users);
        test.ok(Array.isArray(users));
        test.ok(users.length);
        test.equal(users.length, 1);
        
        test.equal(users[0].username, 'adam');
        test.equal(users[0].name, 'Adam');
        test.equal(users[0].id, adamId);
        
        test.done();
    });
};

