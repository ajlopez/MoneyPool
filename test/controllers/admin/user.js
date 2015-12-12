
var userController = require('../../../controllers/admin/user');

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

