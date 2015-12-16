
"use strict"

var db = require('../utils/db');
var dates = require('../utils/dates');

var store = db.createStore('movements');

function clearMovements(cb) {
    store = db.createStore('movements');
    cb(null, null);
};

function newMovement(movement, cb) {
    if (!movement.currency)
        movement.currency = 'ARS';
    if (!movement.datetime)
        movement.datetime = dates.nowString();
    store.add(movement, cb);
};

function getMovementById(id, cb) {
    store.get(id, cb);
}

function getMovementsByUser(userId, cb) {
    store.find({ user: userId }, cb);
}

function getMovementsByLoan(loanId, cb) {
    store.find({ loan: loanId }, cb);
}

function getMovements(cb) {
    store.find(cb);
}

function updateMovement(id, data, cb) {
    store.update(id, data, cb);
}

module.exports = {
    newMovement: newMovement,
    
    getMovementById: getMovementById,
    
    getMovements: getMovements,
    getMovementsByUser: getMovementsByUser,
    getMovementsByLoan: getMovementsByLoan,
    
    updateMovement: updateMovement,
    
    clearMovements: clearMovements
};

