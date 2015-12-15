
function each(values, fn, cb) {
    var n = 0;
    
    doStep();
    
    function doStep() {
        if (n >= values.length)
            return cb(null, null);
            
        try {
            fn(values[n++], function (err, data) {
                if (err)
                    return cb(err, null);
                setImmediate(doStep);
            });
        }
        catch (err) {
            cb(err, null);
        }
    }
}

module.exports = each
