
var loanService = require('../../services/loan');

function listLoans(req, res) {
    loanService.getLoans(function (err, loans) {
        if (err)
            return res.render('admin/error', { error: err });
            
        res.render('admin/loanList', { loans: loans });
    });
}

function newLoan(req, res) {
    loanService.newLoan(req.body, function (err, id) {
        if (err)
            return res.render('admin/error', { error: err });
            
        loanService.getLoanById(id, function (err, loan) {
            if (err)
                return res.render('admin/error', { error: err });
                
            res.render('admin/loanView', { loan: loan });
        });
    });
}

module.exports = {
    listLoans: listLoans,
    newLoan: newLoan
};

