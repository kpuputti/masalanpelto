var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/public/static'));

app.get('/favicon.ico', function (request, response) {
    response.sendfile('public/favicon.ico');
});

app.get('/humans.txt', function (request, response) {
    response.sendfile('public/humans.txt');
});

app.get('/robots.txt', function (request, response) {
    response.sendfile('public/robots.txt');
});

app.get('/', function (request, response) {
    response.sendfile('public/index.html');
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
