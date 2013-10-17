'use strict';

var path = require('path');
var Q = require('q');
var express = require('express');
var swig = require('swig');
var chromeframe = require('express-chromeframe');
var mime = require('mime');
var mongoose = require('mongoose');
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
    var USE_VIEW_CACHE = IS_PRODUCTION ? 'memory' : false;
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

    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', PATH_TO_VIEWS);
    app.set('view cache', USE_VIEW_CACHE);
    swig.setDefaults({
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
        res.locals.csrfToken = req.csrfToken();
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
    var username = req.session.username;

    db.File.find({
        visibility: {$in: auth.getPermissions(username)}
    }).sort({
        name: 1
    }).exec(function (err, files) {
        if (err) {
            log.error('error getting files from db: ' + err);
            res.send(500, {error: 'Could not get files from the database.'});
            return;
        }
        res.render('asiakirjat', {
            title: 'Asiakirjat',
            showUploadLink: auth.hasPermission(username, 'hallitus'),
            files: files
        });
    });
});

app.get('/asiakirjat/uusi', auth.requirePermission('hallitus'), function (req, res) {
    res.render('uusi-asiakirja', {
        title: 'Uusi asiakirja'
    });
});

app.post('/asiakirjat/uusi', auth.requirePermission('hallitus'), function (req, res) {
    var username = req.session.username;
    var name = (req.body.name || '').trim();
    var description = (req.body.description || '').trim();
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
        res.redirect('/asiakirjat/' + file._id);
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
        visibility: username,
        name: name,
        description: description,
        addedBy: username,
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

app.get('/asiakirjat/:id', function (req, res) {
    var username = req.session.username;
    var reqId = (req.params.id || '').trim();
    var fileId;

    try {
        fileId = mongoose.Types.ObjectId(reqId);
    } catch (e) {
        log.error('Requested file id not a proper ObjectId: ' + reqId);
        res.send(404, 'Asiakirjaa ei löydy.');
        return;
    }

    db.File.findOne({_id: fileId}).exec(function (err, file) {
        if (err) {

            // error in db call

            log.error('could not get file ' + reqId + ' from db: ' + err);
            res.send(500, {error: 'Could not get file from database.'});

        } else if (!file) {

            // file not found

            res.send(404, 'Asiakirjaa ei löydy.');

        } else if (!auth.hasPermission(username, file.visibility)) {

            // user has no permission to see the file

            log.warn('User ' + username + ' attempted to access forbidden file: ' + reqId);
            res.send(403, 'Käyttäjällä ei lupaa nähdä tiedostoa.');

        } else {

            var data = {
                title: file.name,
                file: file,
                s3Url: db.S3_ROOT + file._id + '.' + file.extension,
                canChangeVisibility: auth.hasPermission(username, 'hallitus'),
                canRemoveFile: auth.hasPermission(username, 'admin')
            };

            data.possibleVisibilities = auth.getPermissions(username).map(function (vis) {
                return {
                    name: vis,
                    active: file.visibility === vis
                };
            });

            res.render('asiakirja', data);
        }
    });
});

app.post('/asiakirjat/:id', auth.requirePermission('hallitus'), function (req, res) {
    var username = req.session.username;
    var newVisibility = (req.body.visibility || '').trim();
    var reqId = (req.params.id || '').trim();
    var fileId;

    try {
        fileId = mongoose.Types.ObjectId(reqId);
    } catch (e) {
        log.error('Requested file id not a proper ObjectId: ' + reqId);
        res.send(404, 'Asiakirjaa ei löydy.');
        return;
    }

    function onFileSaved(err) {
        if (err) {
            log.error('Could not change visibility for file: ' + reqId);
            res.send(500, {error: 'Could not change visibility.'});
            return;
        }

        req.session.messages.push({
            'type': 'info',
            msg: 'Asiakirjan näkyvyys muutettu tilaan: ' + newVisibility
        });
        res.redirect('/asiakirjat/' + reqId);
    }

    db.File.findOne({_id: fileId}).exec(function (err, file) {
        if (err) {
            log.error('could not get file ' + reqId + ' from db: ' + err);
            res.send(500, {error: 'Could not get file from database.'});
            return;
        }
        log.info('User ' + username + ' attempting to change status from ' +
                 file.visibility + ' to ' + newVisibility + ' for file: ' + reqId);

        file.visibility = newVisibility;
        file.save(onFileSaved);
    });
});

app.get('/asiakirjat/:id/poista', auth.requirePermission('admin'), function (req, res) {
    var reqId = (req.params.id || '').trim();
    var fileId;

    try {
        fileId = mongoose.Types.ObjectId(reqId);
    } catch (e) {
        log.error('Requested file id not a proper ObjectId: ' + reqId);
        res.send(404, 'Asiakirjaa ei löydy.');
        return;
    }

    db.File.findOne({_id: fileId}).exec(function (err, file) {
        if (err) {
            log.error('could not get file ' + reqId + ' from db: ' + err);
            res.send(500, {error: 'Could not get file from database.'});
            return;
        }
        res.render('poista-asiakirja', {
            title: 'Varmista asiakirjan poisto',
            file: file
        });
    });
});

app.post('/asiakirjat/:id/poista', auth.requirePermission('admin'), function (req, res) {
    var reqId = (req.params.id || '').trim();
    var fileId;

    try {
        fileId = mongoose.Types.ObjectId(reqId);
    } catch (e) {
        log.error('Requested file id not a proper ObjectId: ' + reqId);
        res.send(404, 'Asiakirjaa ei löydy.');
        return;
    }

    function onFileRemovedFromS3() {
        log.info('File removed from S3: ' + reqId);
    }

    function onFileRemoveFromS3Error(err) {
        log.error('Failed to remove file from S3: ' + reqId, ', error: ' + err);
    }

    function onFileRemovedFromDb(filename) {
        log.info('Removed document from database: ' + reqId);

        db.deleteFile(filename)
            .then(onFileRemovedFromS3, onFileRemoveFromS3Error)
            .done();

        req.session.messages.push({
            'type': 'info',
            msg: 'Asiakirja poistettu.'
        });
        res.redirect('/asiakirjat');
    }

    db.File.findOne({_id: fileId}).exec(function (err, file) {
        if (err) {
            log.error('could not get file ' + reqId + ' from db: ' + err);
            res.send(500, {error: 'Could not get file from database.'});
            return;
        }

        var filename = file._id + '.' + file.extension;

        file.remove(function (err) {
            if (err) {
                log.error('Could not remove document from db: ' + reqId);
                res.send(500, {error: 'Could not remove file.'});
                return;
            }
            onFileRemovedFromDb(filename);
        });
    });
});

app.get('/asukkaille', auth.requirePermission('asukas'), function (req, res) {
    res.render('asukkaille', {
        title: 'asukkaille'
    });
});

app.get('/hallitus', auth.requirePermission('hallitus'), function (req, res) {
    res.render('hallitus', {
        title: 'Hallitus'
    });
});

app.get('/admin', auth.requirePermission('admin'), function (req, res) {
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
    var username = (req.body.username || '').trim();
    var password = (req.body.password || '').trim();

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
    log.info('user ' + req.session.username + ' logout');
    req.session = null;
    res.redirect('/');
});

app.get('/test', auth.requirePermission('admin'), function (req, res) {
    res.render('test', {
        title: 'Test'
    });
});

module.exports = app;
