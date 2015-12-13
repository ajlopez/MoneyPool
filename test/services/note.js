
var noteService = require('../../services/note');
var dates = require('../../utils/dates');
var async = require('simpleasync');

var noteId;

exports['clear nodes'] = function (test) {
    test.async();
    
    noteService.clearNotes(function (err, data) {
        test.ok(!err);
        test.done();
    });
};

exports['new note'] = function (test) {
    test.async();
    
    noteService.newNote({ loan: 1, amount: 1000, user: 2 }, function (err, id) {
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
        
        test.equal(note.loan, 1);
        test.equal(note.id, noteId);
        test.equal(note.status, 'open');
        test.equal(note.currency, 'ARS');
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
    
    noteService.getNotesByUser(2, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 1);
        
        test.equal(notes[0].user, 2);
        test.equal(notes[0].id, noteId);
        
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
    
    noteService.getNotesByLoan(1, function (err, notes) {
        test.ok(!err);
        test.ok(notes);
        test.ok(Array.isArray(notes));
        test.equal(notes.length, 1);
        
        test.equal(notes[0].loan, 1);
        test.equal(notes[0].id, noteId);
        
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
        
        test.equal(notes[0].user, 2);
        test.equal(notes[0].loan, 1);
        test.equal(notes[0].id, noteId);
        
        test.done();
    });
};

exports['update note data'] = function (test) {
    test.async();
    
    noteService.updateNote(noteId, { description: 'A note' }, function (err, id) {
        test.ok(!err);
        test.ok(id);
        test.equal(id, noteId);
        
        noteService.getNoteById(noteId, function (err, note) {
            test.ok(!err);
            test.ok(note);
            test.equal(note.id, noteId);
            test.equal(note.description, 'A note');
            test.equal(note.user, 2);
            
            test.done();
        });
    });
};
