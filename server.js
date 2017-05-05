// server.js

// set up ======================================================================
// get all the tools we need
var path = require("path");
var express  = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');

var port     = process.env.PORT || 443;
var HOST = 'localhost';
var app      = express();

var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
var privateKey = fs.readFileSync('./app/ssl/myKey.key');
var certificate = fs.readFileSync('./app/ssl/myCert.crt');
var passportOneSessionPerUser = require('passport-one-session-per-user')
var httpsOptions = {key: privateKey, cert: certificate};
// your express configuration here


// var httpsServer = https.createServer({
//         cert: fs.readFileSync('./app/ssl/myCert.crt').toString(),
//         key: fs.readFileSync('./app/ssl/myKey.key').toString()
//       }, app);

mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'rethink' })); // session secret
passport.use(new passportOneSessionPerUser())
app.use(passport.authenticate('passport-one-session-per-user'))
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


app.use(flash()); // use connect-flash for flash messages stored in session
console.log(__dirname);



// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
app.use('/', express.static(__dirname, + '/'));

// launch ======================================================================
// var httpsServer = https.createServer({
//         cert: fs.readFileSync('./app/ssl/myCert.crt').toString(),
//         key: fs.readFileSync('./app/ssl/myKey.key').toString()
//       }, app);
server = https.createServer(httpsOptions, app).listen(port);
console.log('HTTPS Server listening on %s:%s', HOST, port);
// app.listen(port);
console.log('The magic happens on port https://localhost:'+port);
