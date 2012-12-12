/*global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var superagent = require('superagent');
var zombie = require('zombie');
var helpers = require('./helpers');
var app = require('../lib/app');

var PORT = 3010;
var APP_URL = 'http://localhost:' + PORT;

before(function (done) {
    console.log('listen on port: ' + PORT);
    app.listen(PORT, function () {
        done();
    });
});

describe('Anonymous user', function () {

    var agent = superagent.agent();

    beforeEach(function (done) {

        // Make sure we're logged out before every test
        agent.get(APP_URL + '/', function (err, res) {
            if (err) {
                done(err);
                return;
            }
            expect(res.status).to.equal(200);
            expect(res.text).to.include('<a href="/kirjaudu-sisaan">Kirjaudu sisään</a>');
            done();
        });
    });

    // Allowed URLs

    it('should see /', function (done) {
        agent.get(APP_URL + '/', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(200);
            done();
        });
    });
    it('should see /kirjaudu-sisaan', function (done) {
        agent.get(APP_URL + '/kirjaudu-sisaan', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(200);
            expect(res.text).to.include('<h2>Kirjaudu sisään</h2>');
            done();
        });
    });
    it('should see /tietoa', function (done) {
        agent.get(APP_URL + '/tietoa', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(200);
            done();
        });
    });
    it('should see /asiakirjat', function (done) {
        agent.get(APP_URL + '/asiakirjat', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(200);
            done();
        });
    });

    // Disallowed URLs

    it('should not see /asukkaille', function (done) {
        agent.get(APP_URL + '/asukkaille', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(403);
            done();
        });
    });
    it('should not see /hallitus', function (done) {
        agent.get(APP_URL + '/hallitus', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(403);
            done();
        });
    });
    it('should not see /admin', function (done) {
        agent.get(APP_URL + '/admin', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(403);
            done();
        });
    });
    it('should not see /asiakirjat/uusi', function (done) {
        agent.get(APP_URL + '/asiakirjat/uusi', function (err, res) {
            if (err) { return done(err); }
            expect(res.status).to.equal(403);
            done();
        });
    });

});

describe('User asukas', function () {

    it('should see allowed URLs', function (done) {

        var username = 'asukas';
        var loggedInNavItems = ['Etusivu', 'Tietoa', 'Asiakirjat', 'Asukkaille'];

        var browser = new zombie.Browser({
            site: APP_URL
        });

        function visit(path) {
            return function () {
                return browser.visit(path);
            };
        }

        browser
            .visit('/')
            .then(function () {

                // Make sure we're logged out
                expect(browser.text('.user-actions')).to.equal('Kirjaudu sisään');

                // Login
                return helpers.loginAs(username, browser);
            })
            .then(function () {

                // Assert header navigation links
                expect(browser.text('header nav a')).to.equal(loggedInNavItems.join(' '));
            })
            .then(visit('/tietoa'))
            .then(visit('/asiakirjat'))
            .then(visit('/asukkaille'))
            .then(done)
            .fail(done);
    });

});

describe('User hallitus', function () {

    it('should see allowed URLs', function (done) {

        var username = 'hallitus';
        var loggedInNavItems = ['Etusivu', 'Tietoa', 'Asiakirjat', 'Asukkaille', 'Hallitus'];

        var browser = new zombie.Browser({
            site: APP_URL
        });

        function visit(path) {
            return function () {
                return browser.visit(path);
            };
        }

        browser
            .visit('/')
            .then(function () {

                // Make sure we're logged out
                expect(browser.text('.user-actions')).to.equal('Kirjaudu sisään');

                // Login
                return helpers.loginAs(username, browser);
            })
            .then(function () {

                // Assert header navigation links
                expect(browser.text('header nav a')).to.equal(loggedInNavItems.join(' '));
            })
            .then(visit('/tietoa'))
            .then(visit('/asiakirjat'))
            .then(visit('/asiakirjat/uusi'))
            .then(visit('/asukkaille'))
            .then(visit('/hallitus'))
            .then(done)
            .fail(done);
    });

});

describe('User admin', function () {

    it('should see allowed URLs', function (done) {

        var username = 'admin';
        var loggedInNavItems = ['Etusivu', 'Tietoa', 'Asiakirjat', 'Asukkaille', 'Hallitus', 'Test', 'Admin'];

        var browser = new zombie.Browser({
            site: APP_URL
        });

        function visit(path) {
            return function () {
                return browser.visit(path);
            };
        }

        browser
            .visit('/')
            .then(function () {

                // Make sure we're logged out
                expect(browser.text('.user-actions')).to.equal('Kirjaudu sisään');

                // Login
                return helpers.loginAs(username, browser);
            })
            .then(function () {

                // Assert header navigation links
                expect(browser.text('header nav a')).to.equal(loggedInNavItems.join(' '));
            })
            .then(visit('/tietoa'))
            .then(visit('/asiakirjat'))
            .then(visit('/asiakirjat/uusi'))
            .then(visit('/asukkaille'))
            .then(visit('/hallitus'))
            .then(visit('/admin'))
            .then(done)
            .fail(done);
    });

});
