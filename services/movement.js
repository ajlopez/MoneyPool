
var ostore = require('ostore');
var dates = require('../utils/dates');

var store = ostore.createStore('movements');

function clearMovements(cb) {
    store = ostore.createStore('movements');
    cb(null, null);
};

function newMovement(movement, cb) {
    if (!movement.currency)
        movement.currency = 'ARS';
    movement.datetime = dates.nowString();
    cb(null, store.add(movement));
};

function getMovementById(id, cb) {
    cb(null, store.get(id));
}

function getMovementsByUser(userId, cb) {
    var movements = store.find({ user: userId });

    cb(null, movements);
}

function getMovementsByLoan(loanId, cb) {
    var movements = store.find({ loan: loanId });

    cb(null, movements);
}

function getMovements(cb) {
    cb(null, store.find());
}

function updateMovement(id, data, cb) {
    store.update(id, data);
    cb(null, id);
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

