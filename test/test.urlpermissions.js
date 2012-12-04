/*global describe, it */

'use strict';

var chai = require('chai');
chai.should();

var request = require('supertest');
var app = require('../lib/app');

describe('Anonymous user', function () {

    // Allowed URLs

    it('should see /', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
    it('should see /tietoa', function (done) {
        request(app)
            .get('/tietoa')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
    it('should see /asiakirjat', function (done) {
        request(app)
            .get('/asiakirjat')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
    it('should see /kirjaudu-sisaan', function (done) {
        request(app)
            .get('/kirjaudu-sisaan')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });

    // Disallowed URLs

    it('should not see /asukkaille', function (done) {
        request(app)
            .get('/asukkaille')
            .expect(403, done);
    });
    it('should not see /hallitus', function (done) {
        request(app)
            .get('/hallitus')
            .expect(403, done);
    });
    it('should not see /admin', function (done) {
        request(app)
            .get('/admin')
            .expect(403, done);
    });

});

describe('User asukas', function () {

});

describe('User hallitus', function () {

});

describe('User admin', function () {

});
