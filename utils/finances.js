
function calculatePayments(amount, monthlyRate, days, nperiods) {
    var periodAmount = (amount / nperiods).toFixed(2);
    var periodRate = Math.exp(Math.log(monthlyRate) / 30 * days);
    
    var periods = [];
    
    var rate = 1 + periodRate / 100;
    
    for (var k = 0; k < nperiods; k++)
        periods.push({ 
            capital: periodAmount,
            interest: ((amount - periodAmount * k) * (rate - 1)).toFixed(2)
        });
        
    return periods;
}

module.exports = {
    calculatePayments: calculatePayments
};

