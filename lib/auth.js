'use strict';

var Q = require('q');
var bcrypt = require('bcrypt');
var logging = require('./logging');

var log = logging.createLogger('auth');

function btoa(s) {
    return (new Buffer(s, 'base64')).toString('ascii');
}

var PASSWORD_HASH_ASUKAS = btoa(process.env.PASSWORD_HASH_ASUKAS);
var PASSWORD_HASH_HALLITUS = btoa(process.env.PASSWORD_HASH_HALLITUS);
var PASSWORD_HASH_ADMIN = btoa(process.env.PASSWORD_HASH_ADMIN);

if (!PASSWORD_HASH_ASUKAS || !PASSWORD_HASH_HALLITUS || !PASSWORD_HASH_ADMIN) {
    log.error('passwords missing from env');
    throw new Error('passwords missing from env');
}

var accounts = {
    asukas: {
        passwordHash: PASSWORD_HASH_ASUKAS
    },
    hallitus: {
        passwordHash: PASSWORD_HASH_HALLITUS
    },
    admin: {
        passwordHash: PASSWORD_HASH_ADMIN
    }
};

var BCRYPT_ROUNDS = 10;

exports.getHash = function (str) {
    var deferred = Q.defer();
    bcrypt.hash(str, BCRYPT_ROUNDS, deferred.makeNodeResolver());
    return deferred.promise;
};

exports.compare = function (password, requiredHash) {
    var deferred = Q.defer();

    bcrypt.compare(password, requiredHash, function (err, match) {
        if (err) {
            deferred.reject(err);
        } else if (!match) {
            deferred.reject(new Error('Password hashes do not match.'));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
};

exports.getPermissions = function (username) {
    var permissions = {
        'default': ['julkinen'],
        asukas:    ['julkinen', 'asukas'],
        hallitus:  ['julkinen', 'asukas', 'hallitus'],
        admin:     ['julkinen', 'asukas', 'hallitus', 'admin']
    };
    if (!username) {
        return permissions['default'];
    }
    var user = permissions.hasOwnProperty(username) ? username : 'default';
    return permissions[user];
};

exports.hasPermission = function (username, permission) {
    return exports.getPermissions(username).indexOf(permission) !== -1;
};

exports.requirePermission = function (permission) {

    return function (req, res, next) {
        var username = req.session ? req.session.username : null;

        if (exports.hasPermission(username, permission)) {
            next();
        } else {
            log.warn('user "' + username +
                     '" attempted to access unauthorized URL: ' + req.path +
                     ' from IP: ' + req.ip);
            res.send(403);
        }
    };
};

exports.authenticate = function (username, password, callback) {
    var isValidUsername = accounts.hasOwnProperty(username);

    if (!isValidUsername) {
        log.info('attempt to log in with an unknown username: ' + username);
        callback(new Error('Invalid credentials.'));
        return;
    }

    var account = accounts[username];

    function success() {
        callback(null, username);
    }

    function error(err) {
        callback(err);
    }

    Q.when(exports.compare(password, account.passwordHash), success, error);
};
