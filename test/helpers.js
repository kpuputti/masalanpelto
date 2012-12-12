'use strict';

var Q = require('q');
var expect = require('chai').expect;

exports.loginAs = function (username, browser) {
    var deferred = Q.defer();

    var password = process.env['TEST_PASSWORD_' + username.toUpperCase()];
    if (!password) {
        throw new Error('Test password not found for user: ' + username);
    }

    browser
        .visit('/kirjaudu-sisaan')
        .then(function () {
            return browser
                .fill('username', username)
                .fill('password', password)
                .pressButton('[type=submit]');
        })
        .then(function () {
            expect(browser.location.pathname).to.equal('/');
            expect(browser.text('.messages')).to.equal('Kirjautunut sisään tunnuksella ' + username);
            expect(browser.text('.user-actions')).to.equal(username + ' | Kirjaudu ulos');
            deferred.resolve();
        })
        .fail(deferred.reject);

    return deferred.promise;
};
