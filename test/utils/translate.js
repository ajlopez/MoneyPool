
var translate = require('../../utils/translate');

var statuses = require('../../data/statuses');

exports['translate status'] = function (test) {
    for (var key in statuses) {
        test.equal(translate.status(key), statuses[key].description);
    }
};

