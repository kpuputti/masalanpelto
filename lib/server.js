var app = require('./app');
var logging = require('./logging');

var log = logging.createLogger('server');
var port = process.env.PORT || 5000;

process.on('uncaughtException', function (err) {
    log.error('uncaught exception: ' + err);
    process.exit(1);
});

app.listen(port, function () {
    log.info('Listening on port: ' + port);
});
