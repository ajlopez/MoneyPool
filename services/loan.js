
var ostore = require('ostore');
var dates = require('../utils/dates');

var store = ostore.createStore('loans');

function clearLoans(cb) {
    store = ostore.createStore('loans');
    cb(null, null);
};

function addLoan(loan, cb) {
    loan.status = 'pending';
    loan.created = dates.nowString();
    cb(null, store.add(loan));
};

function getLoanById(id, cb) {
    cb(null, store.get(id));
}

function getLoansByUser(userId, cb) {
    var loans = store.find({ user: userId });

    cb(null, loans);
}

function getLoans(cb) {
    cb(null, store.find());
}

function updateLoan(id, data, cb) {
    store.update(id, data);
    cb(null, id);
}

module.exports = {
    addLoan: addLoan,
    
    getLoanById: getLoanById,
    
    getLoans: getLoans,
    getLoansByUser: getLoansByUser,
    
    updateLoan: updateLoan,
    
    clearLoans: clearLoans
};

