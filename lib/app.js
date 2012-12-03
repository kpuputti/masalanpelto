/*jshint es5: true */

var path = require('path');
var Q = require('q');
var express = require('express');
var consolidate = require('consolidate');
var swig = require('swig');
var chromeframe = require('express-chromeframe');
var mime = require('mime');
var auth = require('./auth');
var nav = require('./nav');
var db = require('./db');
var logging = require('./logging');
var filters = require('./filters');

var log = logging.createLogger('app');
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

    log.info('configure app in env: ' + APP_ENV);

    // Swig templating config

    app.engine('.html', consolidate.swig);
    app.set('view engine', 'html');
    app.set('views', PATH_TO_VIEWS);
    app.set('view cache', USE_VIEW_CACHE);
    swig.init({
        root: PATH_TO_VIEWS,
        allowErrors: true,
        cache: USE_VIEW_CACHE,
        filters: filters
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
    app.use(chromeframe());
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

    app.use(function (req, res, next) {
        res.locals.messages = req.session.messages || [];
        req.session.messages = [];
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

    db.File.find().exec(function (err, files) {
        if (err) {
            log.error('error getting files from db: ' + err);
            // TODO: return 500 etc.
            process.exit(1);
        }
        res.render('asiakirjat', {
            title: 'Asiakirjat',
            showUploadLink: canAddFiles(username),
            files: files
        });
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

    if (!name || !userfile) {
        log.warn('missing fields in upload form');
        req.session.messages.push({
            'type': 'error',
            msg: 'Nimi tai tiedosto puuttuu.'
        });
        res.redirect('/asiakirjat/uusi');
        return;
    }

    function onFileSaved(file) {
        log.info('saved file: ' + file._id);
        res.redirect('/asiakirjat');
    }

    function onFileSaveError(err) {
        log.warn('could not save file: ' + err);
        req.session.messages.push({
            'type': 'error',
            msg: 'Tiedostoa ei pystytty tallentamaan: ' + err.message
        });
        res.redirect('/asiakirjat');
    }

    var doc = {
        status: 'pending',
        visibility: req.session.username,
        name: name,
        description: description,
        addedBy: req.session.username,
        originalName: userfile.name,
        type: userfile.type,
        extension: mime.extension(userfile.type),
        lastModifiedDate: userfile.lastModifiedDate,
        size: userfile.size
    };

    // TODO: save in bg, add polling to check status

    Q.when(db.saveFile(doc, userfile))
        .then(onFileSaved)
        .fail(onFileSaveError)
        .done();

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

app.get('/kirjaudu-sisaan', function (req, res) {
    res.render('kirjaudu-sisaan', {
        title: 'Kirjaudu sisään'
    });
});

app.post('/kirjaudu-sisaan', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    auth.authenticate(username, password, function (err, user) {
        if (err) {
            log.error('error in authentication: ' + err);
            req.session.messages.push({
                'type': 'error',
                msg: 'Tunnus tai salasana väärä.'
            });
            res.redirect('/kirjaudu-sisaan');
            return;
        }
        req.session.loggedIn = true;
        req.session.username = user;
        log.info('user "' + user + '" logged in from IP: ' + req.ip);
        req.session.messages.push({
            'type': 'info',
            'msg': 'Kirjautunut sisään tunnuksella ' + user
        });
        res.redirect('/');
    });
});

app.get('/kirjaudu-ulos', function (req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = app;
