var express = require('express');
var consolidate = require('consolidate');
var swig = require('swig');
var path = require('path');

var app = express();
var APP_ENV = app.get('env');
var IS_PRODUCTION = APP_ENV === 'production';

console.log('create app in env: ' + APP_ENV);

app.configure(function () {

    // Swig templating config

    app.engine('.html', consolidate.swig);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.set('view cache', IS_PRODUCTION);
    swig.init({
        root: __dirname + '/views',
        allowErrors: true,
        cache: IS_PRODUCTION
    });

    // Other Express config

    app.set('case sensitive routing', true);
    app.set('strict routing', true);

    // Middleware

    app.use(express.logger(IS_PRODUCTION ? 'default' : 'dev'));
    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser(process.env.COOKIE_SECRET || 'cookie secret'));
    app.use(express.session({
        secret: process.env.SESSION_SECRET || 'session secret'
    }));
    app.use(express.csrf());

    var dayInMilliseconds = 24 * 60 * 60 * 1000;
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge: dayInMilliseconds
    }));

    if (!IS_PRODUCTION) {
        app.use(express.errorHandler());
    }
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', function (req, res) {
    res.render('index');
});

module.exports = app;
