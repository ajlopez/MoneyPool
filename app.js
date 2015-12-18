var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var userRoutes = require('./routes/user');
var myRoutes = require('./routes/my');
var adminRoutes = require('./routes/admin.js');
var adminUserRoutes = require('./routes/admin/user');
var adminLoanRoutes = require('./routes/admin/loan');

var app = express();

var session = require('express-session');

app.use(session({
    secret: 'dog and cat',
    resave: false,
    saveUninitialized: true
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.isAuthenticated = function () {
        return req.session && req.session.user;
    };
    
    res.locals.isAdmin = function () {
        return req.session && req.session.user && req.session.user.isAdmin;
    };
    
    res.locals.getUsername = function () {
        return req.session.user.username;
    };
    
    next();
});

app.use('/', routes);

app.use('/user', userRoutes);

app.all('/my', requiredAuthentication);
app.all('/my/*', requiredAuthentication);

app.use('/my', myRoutes);

app.all('/admin', requiredAuthentication);
app.all('/admin/*', requiredAuthentication);

app.all('/admin', requiredAdminAuthentication);
app.all('/admin/*', requiredAdminAuthentication);

app.use('/admin', adminRoutes);
app.use('/admin/user', adminUserRoutes);
app.use('/admin/loan', adminLoanRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/user/login');
    }
}

function requiredAdminAuthentication(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/user/login');
    }
}

module.exports = app;
