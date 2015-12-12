
var userController = require('../../../controllers/admin/user');
var userService = require('../../../services/user');

exports['clear users'] = function (test) {
    test.async();
    
    userService.clearUsers(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['get no users'] = function (test) {
    test.async();
    
    var res = {
        render: function (name, model) {
            test.ok(name);
            test.ok(model);
            test.equal(name, 'userList');
            test.ok(Array.isArray(model));
            test.equal(model.length, 0);
            
            test.done();
        }
    };
    
    var req = { };
    
    userController.getUsers(req, res);
};

exports['add user'] = function (test) {
    test.async();
    
    var res = {
        render: function (name, model) {
            test.ok(name);
            test.ok(model);
            test.equal(name, 'userView');
            
            test.equal(typeof model, 'object');
            test.equal(typeof model.user, 'object');
            test.ok(model.user.id);
            test.equal(model.user.username, req.body.username);
            test.equal(model.user.firstName, req.body.firstName);
            test.equal(model.user.lastName, req.body.lastName);
            test.equal(model.user.genre, req.body.genre);
            test.equal(model.user.age, req.body.age);
            
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

