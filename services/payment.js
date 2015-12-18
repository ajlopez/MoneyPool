
"use strict"

var db = require('../utils/db');
var dates = require('../utils/dates');

function clearPayments(cb) {
    db.createStore('payments');
    cb(null, null);
};

function newPayment(payment, cb) {
    var store = db.store('payments');

    store.add(payment, cb);
};

function getPaymentById(id, cb) {
    var store = db.store('payments');

    store.get(id, cb);
}

function getPaymentsByLoan(loanId, cb) {
    var store = db.store('payments');

    store.find({ loan: loanId }, cb);
}

function getPayments(cb) {
    var store = db.store('payments');

    store.find(cb);
}

function updatePayment(id, data, cb) {
    var store = db.store('payments');

    store.update(id, data, cb);
}

module.exports = {
    newPayment: newPayment,
    
    getPaymentById: getPaymentById,
    
    getPayments: getPayments,
    getPaymentsByLoan: getPaymentsByLoan,
    
    updatePayment: updatePayment,
    
    clearPayments: clearPayments
};

