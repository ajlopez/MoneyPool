
var async = require('simpleasync');
var sl = require('simplelists');

var userService = require('../services/user');
var loanService = require('../services/loan');
var noteService = require('../services/note');
var movementService = require('../services/movement');

var translate = require('../utils/translate');
var dates = require('../utils/dates');
var scorings = require('../data/scorings');
var userdata = require('../data/userdata');

function getCurrentUserId(req) {
    var id = req.session.user.id;

    if (id.length && id.length < 6)
        id = parseInt(id);
        
    return id;
}

function getId(req) {
    var id = req.params.id;

    if (id.length && id.length < 6)
        id = parseInt(id);
        
    return id;
}

function viewMyUser(req, res) {
    var model = { };
    
    var id = getCurrentUserId(req);
        
    async()
    .then(function (data, next) {
        userService.getUserById(id, next);
    })
    .then(function (user, next) {
        user.scoringDescription = translate.scoring(user.scoring);
        model.user = user;
        model.userdata = userdata;

        res.render('my/userView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function viewOtherUser(req, res) {
    var model = { };
    var id = req.params.id;
    
    if (id.length && id.length < 6)
        id = parseInt(id);
    
    async()
    .then(function (data, next) {
        userService.getUserById(id, next);
    })
    .then(function (user, next) {
        user.scoringDescription = translate.scoring(user.scoring);
        model.user = user;
        loanService.getLoansByUser(id, next);
    })
    .then(function (loans, next) {
        translate.statuses(loans);

        model.loans = loans;
        
        model.scorings = [];
        
        for (var scoring in scorings)
            model.scorings.push(scoring);

        res.render('my/otherUserView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function viewOtherLoan(req, res) {
    var model = { };
    var id = req.params.id;
    
    if (id.length && id.length < 6)
        id = parseInt(id);
    
    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (loan, next) {
        loan.statusDescription = translate.status(loan.status);
        model.loan = loan;
        translate.user(model.loan.user, next);
    })
    .then(function (data, next) {
        model.loan.userDescription = data;
                
        if (model.loan.status != 'accepted')
            return next(null, null);
            
        loanService.getLoanStatusToDate(id, dates.todayString(), next);
    })
    .then(function (status, next) {
        model.status = status;
                
        if (model.loan.status != 'open')
            return next(null, null);
            
        loanService.simulateLoanPayments(id, dates.todayString(), next);
    })
    .then(function (payments, next) {
        model.payments = payments;
        
        noteService.getNotesByLoan(id, next);
    })
    .then(function (notes, next) {
        model.notes = notes;
        
        if (notes)
            model.totalNotes = sl.sum(notes, ['amount']).amount;
        
        if (!notes)
            return next(null, null);

        translate.statuses(notes);
        translate.users(notes, next);
    })
    .then(function (notes, next) {
        movementService.getMovementsByLoan(id, next);
    })
    .then(function (movements, next) {
        model.movements = movements;
        sl.sort(movements, 'datetime');
        translate.users(movements, next);
    })
    .then(function (notes, next) {
        res.render('my/otherLoanView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function listMyLoans(req, res) {
    var model = { };
    
    var id = getCurrentUserId(req);
        
    async()
    .then(function (data, next) {
        loanService.getLoansByUser(id, next);
    })
    .then(function (loans, next) {
        translate.statuses(loans);

        model.loans = loans;

        res.render('my/loanList', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function listMyMovements(req, res) {
    var model = { };
    
    var id = getCurrentUserId(req);
        
    async()
    .then(function (data, next) {
        movementService.getMovementsByUser(id, next);
    })
    .then(function (movements, next) {
        model.movements = sl.sort(movements, 'datetime');
        translate.movtypes(model.movements);
        translate.loans(model.movements, next);
    })
    .then(function (data, next) {
        res.render('my/movementList', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function newMyLoan(req, res) {
    var model = { };

    res.render('my/loanNew', model);
}

function createMyLoan(req, res) {
    var loan = { };
    
    loan.amount = parseFloat(req.body.amount);
    loan.periods = parseInt(req.body.periods);
    loan.user = getCurrentUserId(req);

    async()
    .then(function (data, next) {
        loanService.newLoan(loan, next);
    })
    .then(function (data, next) {
        res.redirect('/my/loan');
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function viewMyLoan(req, res) {
    var id = getId(req);
    
    var model = { };
    
    var loan;

    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (data, next) {
        loan = data;
        
        if (!loan || loan.user != getCurrentUserId(req))
            return res.redirect('/my');
        
        loan.statusDescription = translate.status(loan.status);
        
        model.loan = loan;
        
        if (loan.status != 'accepted')
            return next(null, null);
            
        loanService.getLoanStatusToDate(id, dates.todayString(), next);
    })
    .then(function (status, next) {
        model.status = status;
        
        if (loan.status != 'open')
            return next(null, null);
            
        loanService.simulateLoanPayments(id, dates.todayString(), next);
    })
    .then(function (payments, next) {
        model.payments = payments;
        
        noteService.getNotesByLoan(id, next);
    })
    .then(function (notes, next) {
        model.notes = notes;
        
        if (notes)
            model.totalNotes = sl.sum(notes, ['amount']).amount;
        
        if (!notes)
            return next(null, null);

        translate.statuses(notes);
        translate.users(notes, next);
    })
    .then(function (notes, next) {
        res.render('my/loanView', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function acceptMyLoan(req, res) {
    var id = getId(req);

    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (loan, next) {
        if (!loan || loan.user != getCurrentUserId(req))
            return res.redirect('/my');
        
        if (loan.status != 'open')
            return res.redirect('/my/loan/' + id);
            
        loanService.acceptLoan(id, next);
    })
    .then(function (loan, next) {
        res.redirect('/my/loan/' + id);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function rejectMyLoan(req, res) {
    var id = getId(req);

    async()
    .then(function (data, next) {
        loanService.getLoanById(id, next);
    })
    .then(function (loan, next) {
        if (!loan || loan.user != getCurrentUserId(req))
            return res.redirect('/my');
        
        if (loan.status != 'open')
            return res.redirect('/my/loan/' + id);
            
        loanService.rejectLoan(id, next);
    })
    .then(function (loan, next) {
        res.redirect('/my/loan/' + id);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function doInvest(req, res) {
    var model = { };
    
    async()
    .then(function (data, next) {
        loanService.getOpenLoans(next);
    })
    .then(function (loans, next) {
        var userId = getCurrentUserId(req);
        
        loans = sl.where(loans, function (loan) { return loan.user != userId });
            
        model.loans = loans;
        
        res.render('my/investList', model);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();
}

function newNote(req, res) {
    var id = getId(req);
    res.render('my/noteNew', { loanId: id });
}

function createNote(req, res) {
    var loanId = getId(req);
    
    var amount = parseFloat(req.body.amount);
    
    async()
    .then(function (data, next) {
        var note = {
            loan: loanId,
            amount: amount,
            user: getCurrentUserId(req)
        };
        
        noteService.newNote(note, next);
    })
    .then(function (data, next) {
        res.redirect('/my/oloan/' + loanId);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();    
}
 
function newPayment(req, res) {
    var id = getId(req);
    res.render('my/payNew', { loanId: id });
}

function createPayment(req, res) {
    var loanId = getId(req);
    
    var amount = parseFloat(req.body.amount);
    
    async()
    .then(function (data, next) {
        var movdata = {
            amount: amount
        };
        
        loanService.doPayment(loanId, movdata, next);
    })
    .then(function (data, next) {
        res.redirect('/my/loan/' + loanId);
    })
    .fail(function (err) {
        res.render('error', { error: err });
    })
    .run();    
} 

module.exports = {
    viewMyUser: viewMyUser,

    viewOtherUser: viewOtherUser,
    viewOtherLoan: viewOtherLoan,
    
    listMyLoans: listMyLoans,
    viewMyLoan: viewMyLoan,
    newMyLoan: newMyLoan,
    createMyLoan: createMyLoan,
    acceptMyLoan: acceptMyLoan,
    rejectMyLoan: rejectMyLoan,
    
    doInvest: doInvest,
    
    newNote: newNote,
    createNote: createNote,
    
    newPayment: newPayment,
    createPayment: createPayment,
    
    listMyMovements: listMyMovements
};

