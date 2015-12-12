
var userController = require('../../../controllers/admin/user');
var userService = require('../../../services/user');

var adamId;
var adam;

exports['clear users'] = function (test) {
    test.async();
    
    userService.clearUsers(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['list no users'] = function (test) {
    test.async();
    
    var res = {
        render: function (name, model) {
            test.ok(name);
            test.ok(model);
            test.equal(name, 'admin/userList');
            test.ok(model.users);
            test.ok(Array.isArray(model.users));
            test.equal(model.users.length, 0);
            
            test.done();
        }
    };
    
    var req = { };
    
    userController.listUsers(req, res);
};

exports['add user'] = function (test) {
    test.async();
    
    var res = {
        render: function (name, model) {
            test.ok(name);
            test.ok(model);
            test.equal(name, 'admin/userView');
            
            test.equal(typeof model, 'object');
            test.equal(typeof model.user, 'object');
            test.ok(model.user.id);
            test.equal(model.user.username, req.body.username);
            test.equal(model.user.firstName, req.body.firstName);
            test.equal(model.user.lastName, req.body.lastName);
            test.equal(model.user.genre, req.body.genre);
            test.equal(model.user.age, req.body.age);
            
            adamId = model.user.id;
            adam = model.user;
            
            test.done();
        }
    };
    
    var req = { 
        body: {
            username: 'adam',
            firstName: 'Adam',
            lastName: 'Smith',
            genre: 'M',
            age: 800
        }
    };
    
    userController.addUser(req, res);
};

exports['list users'] = function (test) {
    test.async();
    
    var res = {
        render: function (name, model) {
            test.ok(name);
            test.ok(model);
            test.equal(name, 'admin/userList');
            test.ok(model.users);
            test.ok(Array.isArray(model.users));
            test.equal(model.users.length, 1);
            
            test.deepEqual(model.users[0], adam);
            
            test.done();
        }
    };
    
    var req = { };
    
    userController.listUsers(req, res);
};

