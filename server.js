const config = require('./server/config/default.json');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const path = require('path');
const cors = require('cors');
const http = require('http');
const ejwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const app = express();

const passport = require('passport');
const api = require('./server/routes/api');

// Setting Passport strategy
require('./server/routes/passportSetup');

// Mongo session
const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');

if (!!true) {
    app.use(expressSession({
        secret: 'secret',
        cookie: { maxAge: (24 * 60 * 60 * 1000) },
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            clear_interval: (24 * 60 * 60)
        }),
        resave: true,
        saveUninitialized: true
    }));
}

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'src')));

// Initialize passport before setting routes
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
        {
            response: res,                   
            resourceURL: '',    
            customState: 'my_state',
            failureRedirect: '/'
        }
    )(req, res, next);
}, function (req, res) {
    log.info('Login was called in the Sample');
    res.redirect('/');
});

app.delete('/logout', function (req, res, next) {
    req.session.destroy(function(err) {
        req.logOut();
        res.redirect('/');
    });
})

app.get('/oauth/account',
    function (req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function (req, res) {
        console.log('We received a return from AzureAD.');
        res.redirect('/');
    });

app.post('/oauth/account',
    function (req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function (req, res) {
        console.log('We received a return from AzureAD.');
        res.redirect('/');
    });

function isAuthenticated (req, res, next) {
    console.log('Came here');
    if(req.isAuthenticated()) {return next();}
    res.status(401).json({"status" : "false", "message" : "Unauthorized userss"});
}

app.use('/validateUser', isAuthenticated, function (req, res) {
    res.json({ success: true, user: req.user })
})

app.use('/accountInfo', isAuthenticated, function (req, res, next) {
    console.log('Came here');
    return next();
}, function (req, res) {
    res.json({success : true, user: req.user})
})

// API location
// API file for interacting with MongoDB
app.use('/api', isAuthenticated, api);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/index.html'));
});

//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

process.on('uncaughtException', (e) => {
    console.log('Uncaught Exception in node process : ' + e.message);
})

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));