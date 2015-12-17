
var statuses = require('../data/statuses.json');

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

function translateUser(code, cb) {
    var userService = require('../services/user');
    
    userService.getUserById(code, function (err, data) {
        if (err)
            return cb(err, null);
            
        cb(null, data.username);
    });
}

module.exports = {
    status: translateStatus,
    statuses: translateStatuses,
    user: translateUser
};