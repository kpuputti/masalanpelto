var isProduction = process.env.NODE_ENV === 'production';

exports.createLogger = function (name) {
    var prefix = '[' + name + '] ';

    return {
        debug: function (s) {
            if (!isProduction) {
                console.log(prefix + 'DEBUG: ' + s);
            }
        },
        info: function (s) {
            console.log(prefix + 'INFO: ' + s);
        },
        warn: function (s) {
            console.warn(prefix + 'WARN: ' + s);
        },
        error: function (s) {
            console.error(prefix + 'ERROR: ' + s);
        }
    };
};
