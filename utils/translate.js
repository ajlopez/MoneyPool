
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

module.exports = {
    status: translateStatus,
    statuses: translateStatuses
};