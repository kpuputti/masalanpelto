/*global describe, it */

'use strict';

var expect = require('chai').expect;
var filters = require('../lib/filters');

describe('Custom Swig template filters', function () {

    it('should handle empty size', function () {
        expect(filters.filesize('0')).to.equal('0 B');
    });

    it('should handle exact sizes for byte, kilobyte, megabyte and gigabyte', function () {
        expect(filters.filesize('1')).to.equal('1 B');
        expect(filters.filesize('1024')).to.equal('1 kB');
        expect(filters.filesize('1048576')).to.equal('1 MB'); // Math.pow(1024, 2)
        expect(filters.filesize('1073741824')).to.equal('1 GB'); // Math.pow(1024, 3)
    });

    it('should handle random whole number sizes', function () {
        expect(filters.filesize('1000')).to.equal('1000 B');
        expect(filters.filesize('500')).to.equal('500 B');
        expect(filters.filesize('512000')).to.equal('500 kB');
        expect(filters.filesize('524288000')).to.equal('500 MB');
        expect(filters.filesize('536870912000')).to.equal('500 GB');
    });

    it('should handle decimal points', function () {
        expect(filters.filesize('1034')).to.equal('1.01 kB');
        expect(filters.filesize('1900')).to.equal('1.86 kB');
        expect(filters.filesize('2012')).to.equal('1.96 kB');
        expect(filters.filesize('1000000')).to.equal('976.56 kB');
    });

    it('should use gigabytes when size is tera or larger', function () {
        var tera = Math.pow(1024, 4);
        expect(filters.filesize(tera.toString())).to.equal('1024 GB');
    });

});
