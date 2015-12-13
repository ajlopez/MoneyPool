
"use strict"

function fillZeroes(value, length) {
    var text = value.toString();
    
    while (text.length < length)
        text = "0" + text;
        
    return text;
}

module.exports = {
    fillZeroes: fillZeroes
};