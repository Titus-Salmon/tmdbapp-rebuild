var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const homeRouter = require('./routes/home'); //t0d
const applyRouter = require('./routes/apply'); //t0d
const scanRouter = require('./routes/scan'); //t0d
const scan_edit_redirectRouter = require('./routes/scan-edit-redirect'); //t0d
const edit_entryRouter = require('./routes/edit-entry'); //t0d
const edit_success_Router = require('./routes/successful-edit'); //t0d
const delete_success_Router = require('./routes/successful-delete'); //t0d

const helmet = require('helmet'); //t0d //Helmet helps you secure your Express apps by setting various HTTP headers.
const bodyParser = require('body-parser'); //t0d //Node.js body parsing middleware. Parse incoming request bodies in a
//middleware before your handlers, available under the req.body property.

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter); //t0d
app.use('/apply', applyRouter); //t0d
app.use('/scan', scanRouter); //t0d
app.use('/scan-edit-redirect', scan_edit_redirectRouter); //t0d
app.use('/edit-entry', edit_entryRouter); //t0d
app.use('/successful-edit', edit_success_Router); //t0d
app.use('/successful-delete', delete_success_Router); //t0d

app.use(helmet()); //t0d
app.use(bodyParser.urlencoded({ //t0d //bodyParser = middleware
    extended: false
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
