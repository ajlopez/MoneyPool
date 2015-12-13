
"use strict"

var loanService = require('../../services/loan');
var userService = require('../../services/user');
var noteService = require('../../services/note');
var movementService = require('../../services/movement');

var dates = require('../../utils/dates');
var async = require('simpleasync');
var scoring = require('../../scoring.json');

var loanId;
var adamId;
var eveId;
var abelId;

var eveNoteId;
var abelNoteId;

exports['clear loans'] = function (test) {
    test.async();
    
    loanService.clearLoans(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['clear users'] = function (test) {
    test.async();
    
    userService.clearUsers(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['clear notes'] = function (test) {
    test.async();
    
    noteService.clearNotes(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['clear movements'] = function (test) {
    test.async();
    
    movementService.clearMovements(function (err, data) {
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

