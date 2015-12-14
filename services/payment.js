
"use strict"

var db = require('../utils/db');
var dates = require('../utils/dates');

var store = db.createStore('payments');

function clearPayments(cb) {
    store = db.createStore('payments');
    cb(null, null);
};

function newPayment(payment, cb) {
    store.add(payment, cb);
};

function getPaymentById(id, cb) {
    store.get(id, cb);
}

function getPaymentsByLoan(loanId, cb) {
    store.find({ loan: loanId }, cb);
}

function getPayments(cb) {
    store.find(cb);
}

function updatePayment(id, data, cb) {
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

