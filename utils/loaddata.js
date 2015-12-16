
var path = require('path');

function loaddata(filename, cb) {
    if (!filename)
        filename = path.join(__dirname, '..', 'data', 'data.json');
        
    var data = require(filename);
    
    cb(null, null);
}

module.exports = loaddata;