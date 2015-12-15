
"use strict"

var db = require('../../utils/db');
var loanService = require('../../services/loan');
var userService = require('../../services/user');
var noteService = require('../../services/note');
var movementService = require('../../services/movement');

var dates = require('../../utils/dates');
var async = require('simpleasync');
var sl = require('simplelists');
var scoring = require('../../scoring.json');

var loanId;
var adamId;
var eveId;
var abelId;

var eveNoteId;
var abelNoteId;

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['create loan user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'adam', firstName: 'Adam', lastName: 'Paradise', scoring: 'A' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        adamId = data;
        test.done();
    });
};

exports['create investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'eve', firstName: 'Eve', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        eveId = data;
        test.done();
    });
};

exports['create second investor user'] = function (test) {
    test.async();
    
    userService.newUser({ username: 'abel', firstName: 'Abel', lastName: 'Paradise' }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        abelId = data;
        test.done();
    });
};

exports['new loan'] = function (test) {
    test.async();
    
    loanService.newLoan({ user: adamId, amount: 1000 }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['new note from first investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId, { user: eveId, amount: 600 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        eveNoteId = data;
        
        noteService.getNoteById(eveNoteId, function (err, data) {
            test.ok(!err);
            test.ok(data);
            
            test.equal(data.id, eveNoteId);
            test.equal(data.loan, loanId);
            test.equal(data.user, eveId);
            test.equal(data.amount, 600);
            test.equal(data.currency, 'ARS');
            test.ok(dates.isDateTimeString(data.datetime));
            test.equal(data.loan, loanId);
            
            test.done();
        });
    });
};

exports['new note from second investor'] = function (test) {
    test.async();
    
    loanService.newNote(loanId, { user: abelId, amount: 400 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        
        abelNoteId = data;
        
        noteService.getNoteById(abelNoteId, function (err, data) {
            test.ok(!err);
            test.ok(data);
            
            test.equal(data.id, abelNoteId);
            test.equal(data.user, abelId);
            test.equal(data.amount, 400);
            test.equal(data.currency, 'ARS');
            test.ok(dates.isDateTimeString(data.datetime));
            test.equal(data.loan, loanId);
            
            test.done();
        });
    });
};


exports['accept loan'] = function (test) {
    test.async();

    async()
    .then(function (data, next) {
        loanService.acceptLoan(loanId, next);
    })
    .then(function (data, next) {
        loanService.getLoanById(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.equal(data.status, 'accepted');
        test.ok(dates.isDateTimeString(data.accepted));

        noteService.getNotesByLoan(loanId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.all(data, { status: 'accepted' }));

        movementService.getMovementsByUser(adamId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { user: adamId, credit: 1000, debit: 0, loan: loanId, type: 'loan' }));
        
        movementService.getMovementsByUser(eveId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { user: eveId, debit: 600, credit: 0, loan: loanId, type: 'note' }));
        
        movementService.getMovementsByUser(abelId, next);
    })
    .then(function (data, next) {
        test.ok(data);
        test.ok(data.length);
        test.ok(sl.exist(data, { user: abelId, debit: 400, credit: 0, loan: loanId, type: 'note' }));
        
        test.done();
    })
    .run();
};

