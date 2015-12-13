
var db = require('../utils/db');
var dates = require('../utils/dates');

var store = db.createStore('notes');

function clearNotes(cb) {
    store = db.createStore('notes');
    cb(null, null);
};

function newNote(note, cb) {
    if (!note.status)
        note.status = 'open';
    if (!note.currency)
        note.currency = 'ARS';
    note.datetime = dates.nowString();
    store.add(note, cb);
};

function getNoteById(id, cb) {
    store.get(id, cb);
}

function getNotesByUser(userId, cb) {
    store.find({ user: userId }, cb);
}

function getNotesByLoan(loanId, cb) {
    store.find({ loan: loanId }, cb);
}

function getNotes(cb) {
    store.find(cb);
}

function updateNote(id, data, cb) {
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

