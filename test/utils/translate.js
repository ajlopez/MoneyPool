
var translate = require('../../utils/translate');

var statuses = require('../../data/statuses');

exports['translate status'] = function (test) {
    for (var key in statuses) {
        test.equal(translate.status(key), statuses[key].description);
    }
};

exports['translate statuses'] = function (test) {
    var data = [
        { status: 'open' },
        { status: 'rejected' }
    ];
    
    translate.statuses(data);
    
    test.equal(data[0].statusDescription, translate.status(data[0].status));
    test.equal(data[1].statusDescription, translate.status(data[1].status));
};


