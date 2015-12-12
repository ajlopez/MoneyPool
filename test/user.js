
var userService = require('../services/user');

exports['add user'] = function (test) {
    var id = userService.addUser({ name: 'Adam' });
    
    test.ok(id);
};