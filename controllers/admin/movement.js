
var async = require('simpleasync');
var sl = require('simplelists');

var movementService = require('../../services/movement');
var translate = require('../../utils/translate');
var dates = require('../../utils/dates');

function listMovements(req, res) {
    var model = { }
    async()
    .then(function (data, next) {
        movementService.getMovements(next);
    })
    .then(function (data, next) {
        model.movements = data;
        translate.users(model.movements, next);
    })
    .then(function (data, next) {
        res.render('admin/movementList', model);
    })
    .fail(function (err) {
        res.render('admin/error', { error: err });
    })
    .run();
}

module.exports = {
    listMovements: listMovements
};

