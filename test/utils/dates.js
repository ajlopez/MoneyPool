
var dates = require('../../utils/dates');

exports['to normal date string'] = function (test) {
    var date = new Date(2015,11,10);
    var result = dates.toNormalDateString(date);
    
    test.ok(result);
    test.equal(result, "2015-12-10");
};

exports['to normal date time string'] = function (test) {
    var date = new Date(2015,11,10,2,3,4);
    var result = dates.toNormalDateTimeString(date);
    
    test.ok(result);
    test.equal(result, "2015-12-10 02:03:04");
};

exports['is date time string'] = function (test) {
    test.strictEqual(dates.isDateTimeString(null), false);
    test.strictEqual(dates.isDateTimeString('2015'), false);
    test.strictEqual(dates.isDateTimeString('2015-12-10'), false);
    test.strictEqual(dates.isDateTimeString('2015-12-10 00:00'), false);
    test.strictEqual(dates.isDateTimeString('2015-12-10 00:00:00'), true);
    test.strictEqual(dates.isDateTimeString('2015-12-10 01:02:03'), true);
    test.strictEqual(dates.isDateTimeString('2015:12-10 00-00:00'), false);
    test.strictEqual(dates.isDateTimeString('2015-12-10 00-00:00'), false);
    test.strictEqual(dates.isDateTimeString('2015-12-10 00-00:00 Z'), false);
};

exports['is date string'] = function (test) {
    test.strictEqual(dates.isDateString(null), false);
    test.strictEqual(dates.isDateString('2015'), false);
    test.strictEqual(dates.isDateString('2015-12-10'), true);
    test.strictEqual(dates.isDateString('2015-12-10 00:00'), false);
    test.strictEqual(dates.isDateString('2015-12-10 00:00:00'), false);
    test.strictEqual(dates.isDateString('2015-12-10 01:02:03'), false);
    test.strictEqual(dates.isDateString('2015:12-10 00-00:00'), false);
    test.strictEqual(dates.isDateString('2015-12-10 00-00:00'), false);
    test.strictEqual(dates.isDateString('2015-12-10 00-00:00 Z'), false);
};

exports['calculate dates'] = function (test) {
    var days = dates.calculateDates('2015-01-05', 30, 3);
    
    test.ok(days);
    test.ok(Array.isArray(days));
    test.equal(days.length, 3);
    
    test.equal(days[0], '2015-02-04');
    test.equal(days[1], '2015-03-06');
    test.equal(days[2], '2015-04-05');
};

exports['from date time to date'] = function (test) {
    test.equal(dates.removeTime('2015-12-10 00:00:00'), '2015-12-10');
}

exports['dates difference in days'] = function (test) {
    test.equal(dates.getDateDiffDays('2015-12-10', '2015-12-10'), 0);
    test.equal(dates.getDateDiffDays('2015-12-10', '2015-12-20'), 10);
    test.equal(dates.getDateDiffDays('2015-12-10', '2016-01-10'), 31);
}

