
var db = require('../utils/db');
var dates = require('../utils/dates');

function clearNotes(cb) {
    db.createStore('notes');
    cb(null, null);
};

function newNote(note, cb) {
    var store = db.store('notes');

    if (!note.status)
        note.status = 'open';
    if (!note.currency)
        note.currency = 'ARS';
    note.datetime = dates.nowString();
    store.add(note, cb);
};

function getNoteById(id, cb) {
    var store = db.store('notes');

    store.get(id, cb);
}

function getNotesByUser(userId, cb) {
    var store = db.store('notes');

    store.find({ user: userId }, cb);
}

function getNotesByLoan(loanId, cb) {
    var store = db.store('notes');

    store.find({ loan: loanId }, cb);
}

function getNotes(cb) {
    var store = db.store('notes');

    store.find(cb);
}

function updateNote(id, data, cb) {
    var store = db.store('notes');

    store.update(id, data, cb);
}

module.exports = {
    newNote: newNote,
    
    getNoteById: getNoteById,
    
    getNotes: getNotes,
    getNotesByUser: getNotesByUser,
    getNotesByLoan: getNotesByLoan,
    
    updateNote: updateNote,
    
    clearNotes: clearNotes
};

