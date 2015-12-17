
var statuses = require('../data/statuses.json');

function translateStatus(code) {
    if (statuses[code] && statuses[code].description)
        return statuses[code].description;
        
    return code;
}

module.exports = {
    status: translateStatus
};