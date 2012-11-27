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

    var headers = {
        'Content-Type': userfile.type
    };
    var filename = userfile.name;

    var handler = s3.putFile(userfile.path, filename, headers, function (err) {
        if (err) {
            console.warn('Could not upload to S3: ' + err);
            return;
        }
        console.log('successfully uploaded file to S3: ' + filename);
    });

    handler.on('progress', function (info) {
        console.log(info.written + '/' + info.total +
                    ' (' + info.percent + '%) uploaded: ' + filename);
    });

    // Return right away and upload to S3 in the background
    callback(null);
}

module.exports = {
    saveAsiakirja: saveAsiakirja
};
