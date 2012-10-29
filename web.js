var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    response.sendfile('public/index.html');
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
