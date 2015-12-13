
var ostore = require('ostore');
var dates = require('../utils/dates');

var store = ostore.createStore('notes');

function clearNotes(cb) {
    store = ostore.createStore('notes');
    cb(null, null);
};

function newNote(note, cb) {
    if (!note.status)
        note.status = 'open';
    if (!note.currency)
        note.currency = 'ARS';
    note.created = dates.nowString();
    cb(null, store.add(note));
};

function getNoteById(id, cb) {
    cb(null, store.get(id));
}

function getNotesByUser(userId, cb) {
    var notes = store.find({ user: userId });

    cb(null, notes);
}

function getNotesByLoan(loanId, cb) {
    var notes = store.find({ loan: loanId });

    cb(null, notes);
}

function getNotes(cb) {
    cb(null, store.find());
}

function updateNote(id, data, cb) {
    store.update(id, data);
    cb(null, id);
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

