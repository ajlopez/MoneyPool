
var noteService = require('../../services/note');
var userService = require('../../services/user');
var loanService = require('../../services/loan');

var db = require('../../utils/db');
var dates = require('../../utils/dates');
var async = require('simpleasync');

var noteId;
var investorId;
var borrowerId;
var loanId;

exports['clear data'] = function (test) {
    test.async();
    
    db.clear(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['new investor user'] = function (test) {
    test.async();
    
    userService.newUser({ name: "Eve" }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        investorId = id;
        test.done();
    });
};

exports['new borrower user'] = function (test) {
    test.async();
    
    userService.newUser({ name: "Adam" }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        borrowerId = id;
        test.done();
    });
};

exports['new loan'] = function (test) {
    test.async();
    
    loanService.newLoan({ user: borrowerId }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        loanId = id;
        test.done();
    });
};

exports['new note'] = function (test) {
    test.async();
    
    noteService.newNote({ loan: loanId.toString(), amount: 1000, user: investorId.toString() }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        noteId = id;
        test.done();
    });
};

exports['get note by id'] = function (test) {
    test.async();
    
    noteService.getNoteById(noteId, function (err, note) {
        test.ok(!err);
        test.ok(note);
        test.equal(typeof note, 'object');
        
        test.equal(note.status, 'open');
        test.equal(note.currency, 'ARS');
        
        test.ok(db.isNativeId(note.loan));
        test.ok(db.isNativeId(note.user));
        test.equal(note.loan.toString(), loanId.toString());
        test.equal(note.id.toString(), noteId.toString());
        
        test.ok(dates.isDateTimeString(note.datetime));
        
        test.done();
    });
};

exports['get unknown note by id'] = function (test) {
    test.async();
    
    noteService.getNoteById(0, function (err, note) {
        test.ok(!err);
        test.strictEqual(note, null);
        
        test.done();
    });
};

exports['get notes by user'] = function (test) {
    test.async();
    
    noteService.getNotesByUser(investorId, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 1);
        
        test.equal(notes[0].user.toString(), investorId.toString());
        test.equal(notes[0].id.toString(), noteId.toString());
        
        test.done();
    });
};

exports['get note by unknown user'] = function (test) {
    test.async();
    
    noteService.getNotesByUser(0, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 0);
        
        test.done();
    });
};

exports['get notes by loan'] = function (test) {
    test.async();
    
    noteService.getNotesByLoan(loanId, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 1);
        
        test.equal(notes[0].loan.toString(), loanId.toString());
        test.equal(notes[0].user.toString(), investorId.toString());
        test.equal(notes[0].id.toString(), noteId.toString());
        
        test.done();
    });
};

exports['get note by unknown loan'] = function (test) {
    test.async();
    
    noteService.getNotesByLoan(0, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 0);
        
        test.done();
    });
};

exports['get notes'] = function (test) {
    test.async();
    
    noteService.getNotes(function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 1);
        
        test.equal(notes[0].user.toString(), investorId.toString());
        test.equal(notes[0].loan.toString(), loanId.toString());
        test.equal(notes[0].id.toString(), noteId.toString());
        
        test.done();
    });
};

exports['update note data'] = function (test) {
    test.async();
    
    noteService.updateNote(noteId, { description: 'A note' }, function (err, data) {
        test.ok(!err);
        
        noteService.getNoteById(noteId, function (err, note) {
            test.ok(!err);
            test.ok(note);
            test.equal(note.id.toString(), noteId.toString());
            test.equal(note.description, 'A note');
            test.equal(note.user.toString(), investorId.toString());
            
            test.done();
        });
    });
};
