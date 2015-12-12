
var dates = require('../../utils/dates');

exports['to normal date string'] = function (test) {
    var date = new Date(2015,11,10);
    var result = dates.toNormalDateString(date);
    
    test.ok(result);
    test.equal(result, "2015-12-10");
};