
function calculatePayments(amount, monthlyRate, days, nperiods) {
    var periodAmount = parseFloat((amount / nperiods).toFixed(2));
    var periodRate = Math.exp(Math.log(monthlyRate) / 30 * days);
    
    var periods = [];
    
    var rate = 1 + periodRate / 100;
    
    for (var k = 0; k < nperiods; k++)
        periods.push({ 
            capital: periodAmount,
            interest: parseFloat(((amount - periodAmount * k) * (rate - 1)).toFixed(2))
        });
        
    return periods;
}

function calculateInterest(amount, monthlyRate, days) {
    var periodRate = Math.exp(Math.log(monthlyRate) / 30 * days);
    var rate = periodRate / 100;
    return parseFloat((amount * rate).toFixed(2));
}

module.exports = {
    calculatePayments: calculatePayments,
    calculateInterest: calculateInterest
};

