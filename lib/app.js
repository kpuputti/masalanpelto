var express = require('express');
var consolidate = require('consolidate');
var swig = require('swig');
var path = require('path');
var auth = require('./auth');

var app = express();

app.configure(function () {

    var APP_ENV = app.get('env');
    var IS_PRODUCTION = APP_ENV === 'production';
    var USE_VIEW_CACHE = IS_PRODUCTION;
    var PATH_TO_VIEWS = path.join(__dirname, '..', '/views');
    var LOG_MODE = IS_PRODUCTION ? 'default' : 'dev';
    var COOKIE_SECRET = process.env.COOKIE_SECRET || 'cookie secret';
    var SESSION_SECRET = process.env.SESSION_SECRET || 'session secret';
    var PATH_TO_PUBLIC = path.join(__dirname, '..', 'public');

    console.log('configure app in env: ' + APP_ENV);

    // Swig templating config

    app.engine('.html', consolidate.swig);
    app.set('view engine', 'html');
    app.set('views', PATH_TO_VIEWS);
    app.set('view cache', USE_VIEW_CACHE);
    swig.init({
        root: PATH_TO_VIEWS,
        allowErrors: true,
        cache: USE_VIEW_CACHE
    });

    // Other Express config

    app.set('case sensitive routing', true);
    app.set('strict routing', true);

    // Middleware

    app.use(express.logger(LOG_MODE));
    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser(COOKIE_SECRET));
    app.use(express.cookieSession({
        secret: SESSION_SECRET
    }));
    app.use(express.csrf());

    var dayInMilliseconds = 24 * 60 * 60 * 1000;
    app.use(express.static(PATH_TO_PUBLIC, {
        maxAge: dayInMilliseconds
    }));

    // Add extra error reporting for non-production envs
    if (!IS_PRODUCTION) {
        app.use(express.errorHandler());
    }
});

// Routing

app.get('/', function (req, res) {
    res.render('index', {
        loggedIn: req.session.loggedIn,
        username: req.session.username
    });
});

app.get('/login', function (req, res) {
    res.render('login', {
        loggedIn: req.session.loggedIn,
        username: req.session.username,
        _csrf: req.session._csrf
    });
});

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    auth.authenticate(username, password, function (err, user) {
        if (err) {
            res.redirect('/login');
            return;
        }
        req.session.loggedIn = true;
        req.session.username = user;
        res.redirect('/');
    });
});

app.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = app;