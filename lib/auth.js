var Q = require('q');
var bcrypt = require('bcrypt');

var PASSWORD_HASH_ASUKAS = process.env.PASSWORD_HASH_ASUKAS;
var PASSWORD_HASH_HALLITUS = process.env.PASSWORD_HASH_HALLITUS;
var PASSWORD_HASH_ADMIN = process.env.PASSWORD_HASH_ADMIN;

if (!PASSWORD_HASH_ASUKAS || !PASSWORD_HASH_HALLITUS || !PASSWORD_HASH_ADMIN) {
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

exports.getHash = function(str) {
    var deferred = Q.defer();
    bcrypt.hash(str, BCRYPT_ROUNDS, deferred.makeNodeResolver());
    return deferred.promise;
};

exports.compare = function(password, requiredHash) {
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

exports.requireAuthenticatedUser = function() {
    var usernames = Array.prototype.slice.call(arguments);

    function isValidUsername(user) {
        return usernames.indexOf(user) !== -1;
    }

    return function (req, res, next) {
        var username = req.session ? req.session.username : null;
        if (isValidUsername(username)) {
            next();
        } else {
            console.warn('user "' + username +
                         '" attempted to access unauthorized URL: ' + req.path +
                         ' from IP: ' + req.ip);
            res.send(403);
        }
    };
};

exports.authenticate = function(username, password, callback) {
    var isValidUsername = accounts.hasOwnProperty(username);

    if (!isValidUsername) {
        console.log('attempt to log in with an unknown username: ' + username);
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
