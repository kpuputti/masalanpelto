exports.requireAuthenticatedUser = function (username) {
    return function (req, res, next) {
        if (req.session.username === username) {
            next();
        } else {
            // TODO: return 403 Forbidden etc.?
            // Show some msg to the user?
            res.redirect('/login');
        }
    };
};

exports.authenticate = function (username, password, callback) {
    // TODO: create a few users in env vars
    if (username === 'user' && password === 'pass') {
        callback(null, username);
    } else {
        callback(new Error('Invalid credentials.'));
    }
};
