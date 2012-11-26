/*jshint es5: true */

var express = require('express');
var consolidate = require('consolidate');
var swig = require('swig');
var path = require('path');
var auth = require('./auth');
var nav = require('./nav');
var util = require('util');

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
    var PATH_TO_FAVICON = path.join(PATH_TO_PUBLIC, 'favicon.ico');
    var dayInMilliseconds = 24 * 60 * 60 * 1000;
    var weekInMilliseconds = dayInMilliseconds * 7;
    var GOOGLE_ANALYTICS_TRACKING_ID = process.env.GOOGLE_ANALYTICS_TRACKING_ID || null;

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

    // Application locals config

    app.locals({
        siteTitle: 'Masalanpelto',
        GOOGLE_ANALYTICS_TRACKING_ID: GOOGLE_ANALYTICS_TRACKING_ID
    });

    // Middleware

    app.use(express.logger(LOG_MODE));
    app.use(express.compress());
    app.use(express.favicon(PATH_TO_FAVICON, {
        maxAge: weekInMilliseconds
    }));
    app.use(express.bodyParser());
    app.use(express.cookieParser(COOKIE_SECRET));
    app.use(express.cookieSession({
        secret: SESSION_SECRET
    }));
    app.use(express.csrf());

    // Expose session data to the views
    app.use(function (req, res, next) {
        res.locals.session = req.session;
        next();
    });

    // Generate navigation links for the response
    app.use(function (req, res, next) {
        res.locals.nav = nav.getNav(req.path, req.session);
        next();
    });

    app.use(express.static(PATH_TO_PUBLIC, {
        maxAge: dayInMilliseconds
    }));

    // Add extra error reporting for non-production envs
    if (!IS_PRODUCTION) {
        app.use(express.errorHandler());
    }
});

// Helpers

var requireLoggedInUser = auth.requireAuthenticatedUser('asukas', 'hallitus', 'admin');
var requireHallitus = auth.requireAuthenticatedUser('hallitus', 'admin');
var requireAdmin = auth.requireAuthenticatedUser('admin');

function canAddFiles(username) {
    return username === 'admin' || username === 'hallitus';
}

function trim(s) {
    return s ? s.trim() : s;
}

// Routing

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Etusivu'
    });
});

app.get('/tietoa', function (req, res) {
    res.render('about', {
        title: 'Tietoa'
    });
});

app.get('/asiakirjat', function (req, res) {
    var username = req.session ? req.session.username : null;
    res.render('asiakirjat', {
        title: 'Asiakirjat',
        showUploadLink: canAddFiles(username)
    });
});

app.get('/asiakirjat/uusi', requireHallitus, function (req, res) {
    res.render('uusi-asiakirja', {
        title: 'Uusi asiakirja'
    });
});

app.post('/asiakirjat/uusi', requireHallitus, function (req, res) {
    var name = trim(req.body.name);
    var description = trim(req.body.description) || '';
    var userfile = req.files.userfile;

    console.log('name: ' + name);
    console.log('description: ' + description);
    console.log('userfile: ' + util.inspect(userfile));

    if (name && userfile) {
        console.log('new asiakirja uploaded');
        res.redirect('/asiakirjat');
    } else {
        console.warn('missing fields in upload form');
        res.redirect('/asiakirjat');
    }
});

app.get('/test', requireLoggedInUser, function (req, res) {
    res.render('test', {
        title: 'Test'
    });
});

app.get('/asukkaille', requireLoggedInUser, function (req, res) {
    res.render('asukkaille', {
        title: 'asukkaille'
    });
});

app.get('/hallitus', requireHallitus, function (req, res) {
    res.render('hallitus', {
        title: 'Hallitus'
    });
});

app.get('/admin', requireAdmin, function (req, res) {
    res.render('admin', {
        title: 'Admin'
    });
});

app.get('/login', function (req, res) {
    res.render('login', {
        title: 'Kirjaudu sisään'
    });
});

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    auth.authenticate(username, password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/login');
            return;
        }
        req.session.loggedIn = true;
        req.session.username = user;
        console.log('user "' + user + '" logged in from IP: ' + req.ip);
        res.redirect('/');
    });
});

app.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = app;
