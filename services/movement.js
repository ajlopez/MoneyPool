
"use strict"

var db = require('../utils/db');
var dates = require('../utils/dates');

function clearMovements(cb) {
    db.createStore('movements').clear(cb);
};

function newMovement(movement, cb) {
    var store = db.store('movements');

    if (!movement.currency)
        movement.currency = 'ARS';
    if (!movement.datetime)
        movement.datetime = dates.nowString();
        
    if (movement.user)
        movement.user = db.toId(movement.user);
    if (movement.loan)
        movement.loan = db.toId(movement.loan);
    
    store.add(movement, cb);
};

function getMovementById(id, cb) {
    var store = db.store('movements');

    store.get(id, cb);
}

function getMovementsByUser(userId, cb) {
    var store = db.store('movements');

    store.find({ user: userId }, cb);
}

function getMovementsByLoan(loanId, cb) {
    var store = db.store('movements');

    store.find({ loan: loanId }, cb);
}

function getMovements(cb) {
    var store = db.store('movements');

    store.find(cb);
}

function updateMovement(id, data, cb) {
    var store = db.store('movements');

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

