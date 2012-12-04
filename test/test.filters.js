/*global describe, it */

'use strict';

var chai = require('chai');
chai.should();

var filters = require('../lib/filters');

describe('Custom Swig template filters', function () {

    it('should handle empty size', function () {
        filters.filesize('0').should.equal('0 B');
    });

    it('should handle exact sizes for byte, kilobyte, megabyte and gigabyte', function () {
        filters.filesize('1').should.equal('1 B');
        filters.filesize('1024').should.equal('1 kB');
        filters.filesize('1048576').should.equal('1 MB'); // Math.pow(1024, 2)
        filters.filesize('1073741824').should.equal('1 GB'); // Math.pow(1024, 3)
    });

    it('should handle random whole number sizes', function () {
        filters.filesize('1000').should.equal('1000 B');
        filters.filesize('500').should.equal('500 B');
        filters.filesize('512000').should.equal('500 kB');
        filters.filesize('524288000').should.equal('500 MB');
        filters.filesize('536870912000').should.equal('500 GB');
    });

    it('should handle decimal points', function () {
        filters.filesize('1034').should.equal('1.01 kB');
        filters.filesize('1900').should.equal('1.86 kB');
        filters.filesize('2012').should.equal('1.96 kB');
        filters.filesize('1000000').should.equal('976.56 kB');
    });

    it('should use gigabytes when size is tera or larger', function () {
        var tera = Math.pow(1024, 4);
        filters.filesize(tera.toString()).should.equal('1024 GB');
    });

});
