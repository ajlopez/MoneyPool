
var strings = require('../../utils/strings');

exports['left fill with zeroes'] = function (test) {
    test.equal(strings.fillZeroes(42, 2), "42");
    test.equal(strings.fillZeroes(42, 4), "0042");
    test.equal(strings.fillZeroes(0, 4), "0000");
};