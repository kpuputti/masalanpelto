var util = require('util');

function saveAsiakirja(asiakirja, userfile, callback) {
    console.log('saving asiakirja: ' + util.inspect(asiakirja) +
                '\n with file: ' + util.inspect(userfile));
    process.nextTick(function () {
        callback(new Error('saving asiakirja not implemented yet'));
    });
}

module.exports = {
    saveAsiakirja: saveAsiakirja
};
