var app = require('./app');
var logging = require('./logging');

var log = logging.createLogger('server');
var port = process.env.PORT || 5000;

app.listen(port, function () {
    log.info('Listening on port: ' + port);
});
