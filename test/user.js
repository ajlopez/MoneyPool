
var userService = require('../services/user');

exports['add user'] = function (test) {
    test.async();
    
    userService.addUser({ name: 'Adam' }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        test.done();
    });
};