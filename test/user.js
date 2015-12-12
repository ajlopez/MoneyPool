
var userService = require('../services/user');

var adamId;

exports['add user'] = function (test) {
    test.async();
    
    userService.addUser({ name: 'Adam' }, function (err, id) {
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
        test.equal(user.name, 'Adam');
        test.equal(user.id, adamId);
        
        test.done();
    });
};