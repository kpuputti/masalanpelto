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

function getHash(str) {
    var deferred = Q.defer();
    bcrypt.hash(str, BCRYPT_ROUNDS, deferred.makeNodeResolver());
    return deferred.promise;
}

function compare(password, requiredHash) {
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
}

function requireAuthenticatedUser(username) {
    return function (req, res, next) {
        if (req.session.username === username) {
            next();
        } else {
            // TODO: return 403 Forbidden etc.?
            // Show some msg to the user?
            res.redirect('/login');
        }
    };
}

function authenticate(username, password, callback) {
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

    Q.when(compare(password, account.passwordHash), success, error);
}

// Expose named functions for better stack traces.
module.exports = {
    getHash: getHash,
    compare: compare,
    requireAuthenticatedUser: requireAuthenticatedUser,
    authenticate: authenticate
};
