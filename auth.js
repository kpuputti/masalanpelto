exports.authenticate = function (username, password, callback) {
    if (username === 'user' && password === 'pass') {
        callback(null, username);
    } else {
        callback(new Error('Invalid credentials.'));
    }
};
