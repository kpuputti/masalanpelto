var util = require('util');
var knox = require('knox');

var s3 = knox.createClient({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME
});

function saveAsiakirja(asiakirja, userfile, callback) {
    console.log('saving asiakirja: ' + util.inspect(asiakirja) +
                '\n with file: ' + util.inspect(userfile));

    // 1. Save doc to db, set state 'uploading'
    // 2. Upload to S3 with the given ObjectID
    // 3. Set state to 'ready'

    process.nextTick(function () {
        callback(new Error('saving asiakirja not implemented yet'));
    });
}

module.exports = {
    saveAsiakirja: saveAsiakirja
};
