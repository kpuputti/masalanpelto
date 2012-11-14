exports.authenticate = function (username, password, callback) {
    // TODO: create a few users in env vars
    if (username === 'user' && password === 'pass') {
        callback(null, username);
    } else {
        callback(new Error('Invalid credentials.'));
    }
};
