
var movementService = require('../../services/movement');
var dates = require('../../utils/dates');
var async = require('simpleasync');
var db = require('../../utils/db');

var movementId;
var loanId;
var userId;

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['new movement'] = function (test) {
    loanId = db.newId();
    userId = db.newId();
    
    test.async();
    
    movementService.newMovement({ loan: loanId.toString(), debit: 1000, user: userId.toString() }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        movementId = id;
        test.done();
    });
};

exports['get movement by id'] = function (test) {
    test.async();
    
    movementService.getMovementById(movementId, function (err, movement) {
        test.ok(!err);
        test.ok(movement);
        test.equal(typeof movement, 'object');
        
        test.ok(db.isNativeId(movement.loan));
        test.ok(db.isNativeId(movement.user));
        
        test.equal(movement.loan.toString(), loanId.toString());
        test.equal(movement.user.toString(), userId.toString());
        test.equal(movement.debit, 1000);
        test.equal(movement.id.toString(), movementId.toString());
        test.equal(movement.currency, 'ARS');
        test.ok(dates.isDateTimeString(movement.datetime));
        
        test.done();
    });
};

exports['get unknown movement by id'] = function (test) {
    test.async();
    
    movementService.getMovementById(0, function (err, movement) {
        test.ok(!err);
        test.strictEqual(movement, null);
        
        test.done();
    });
};

exports['get movements by user'] = function (test) {
    test.async();
    
    movementService.getMovementsByUser(userId, function (err, movements) {
        test.ok(!err);
        test.ok(movements);
        test.ok(Array.isArray(movements));
        test.equal(movements.length, 1);
        
        test.equal(movements[0].user.toString(), userId.toString());
        test.equal(movements[0].id.toString(), movementId.toString());
        
        test.done();
    });
};

exports['get movement by unknown user'] = function (test) {
    test.async();
    
    movementService.getMovementsByUser(0, function (err, movements) {
        test.ok(!err);
        test.ok(movements);
        test.ok(Array.isArray(movements));
        test.equal(movements.length, 0);
        
        test.done();
    });
};

exports['get movements by loan'] = function (test) {
    test.async();
    
    movementService.getMovementsByLoan(loanId, function (err, movements) {
        test.ok(!err);
        test.ok(movements);
        test.ok(Array.isArray(movements));
        test.equal(movements.length, 1);
        
        test.equal(movements[0].loan.toString(), loanId.toString());
        test.equal(movements[0].id.toString(), movementId.toString());
        
        test.done();
    });
};

exports['get movement by unknown loan'] = function (test) {
    test.async();
    
    movementService.getMovementsByLoan(0, function (err, movements) {
        test.ok(!err);
        test.ok(movements);
        test.ok(Array.isArray(movements));
        test.equal(movements.length, 0);
        
        test.done();
    });
};

exports['get movements'] = function (test) {
    test.async();
    
    movementService.getMovements(function (err, movements) {
        test.ok(!err);
        test.ok(movements);
        test.ok(Array.isArray(movements));
        test.equal(movements.length, 1);
        
        test.equal(movements[0].user.toString(), userId.toString());
        test.equal(movements[0].loan.toString(), loanId.toString());
        test.equal(movements[0].id.toString(), movementId.toString());
        
        test.done();
    });
};

exports['update movement data'] = function (test) {
    test.async();
    
    movementService.updateMovement(movementId, { description: 'A movement' }, function (err, data) {
        test.ok(!err);
        
        movementService.getMovementById(movementId, function (err, movement) {
            test.ok(!err);
            test.ok(movement);
            test.equal(movement.id.toString(), movementId.toString());
            test.equal(movement.description, 'A movement');
            test.equal(movement.loan.toString(), loanId.toString());
            test.equal(movement.user.toString(), userId.toString());
            
            test.done();
        });
    });
};

