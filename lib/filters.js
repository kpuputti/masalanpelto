'use strict';

exports.filesize = function (input) {
    var num = parseInt(input, 10);
    if (isNaN(num)) {
        return input;
    }

    function format(n, prefix) {
        return Math.round(n * 100) / 100 + ' ' + prefix;
    }

    var kilo = 1024;
    var mega = Math.pow(kilo, 2);
    var giga = Math.pow(kilo, 3);

    if (num >= giga) {
        return format(num / giga, 'GB');
    } else if (num >= mega) {
        return format(num / mega, 'MB');
    } else if (num >= kilo) {
        return format(num / kilo, 'kB');
    } else {
        return format(num, 'B');
    }
};
