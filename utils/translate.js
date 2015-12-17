
var statuses = require('../data/statuses.json');
var scorings = require('../data/scorings.json');
var each = require('./each');

function translateStatus(code) {
    if (statuses[code] && statuses[code].description)
        return statuses[code].description;
        
    return code;
}

function translateStatuses(items) {
    items.forEach(function (item) {
        item.statusDescription = translateStatus(item.status);
    });
}

function translateScoring(code) {
    if (scorings[code] && scorings[code].description)
        return scorings[code].description;
    
    if (!code)
        return 'Sin calificación';
        
    return code;
}

function translateScorings(items) {
    items.forEach(function (item) {
        item.scoringDescription = translateScoring(item.scoring);
    });
}

function translateUser(code, cb) {
    var userService = require('../services/user');
    
    userService.getUserById(code, function (err, data) {
        if (err)
            return cb(err, null);
            
        cb(null, data.username);
    });
}

function translateUsers(items, cb) {
    var users = {};
    each(items, function (item, next) {
        if (users[item.user]) {
            item.userDescription = users[item.user];
            return next();
        }
        
        translateUser(item.user, function (err, data) {
            if (err)
                return cb(err, null);
                
            users[item.user] = data;
            item.userDescription = data;
            next();
        });
    }, cb);
}

module.exports = {
    status: translateStatus,
    statuses: translateStatuses,
    scoring: translateScoring,
    scorings: translateScorings,
    user: translateUser,
    users: translateUsers
};