'use strict';

var Q = require('q');
var knox = require('knox');
var mongoose = require('mongoose');
var logging = require('./logging');

var log = logging.createLogger('db');

// S3 knox setup
var s3 = knox.createClient({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME
});

// MongoDB Mongoose setup
var DB_URL = process.env.MONGOHQ_URL || process.env.MONGODB_URL;
var db = mongoose.createConnection(DB_URL);

var fileSchema = mongoose.Schema({
    status: String,
    visibility: String,
    name: String,
    description: String,
    addedBy: String,
    dateAdded: {'type': Date, 'default': Date.now},
    originalName: String,
    type: String,
    extension: String,
    lastModifiedDate: Date,
    size: {'type': Number, min: 0}
});

var File = exports.File = db.model('File', fileSchema);

function saveFileToS3(path, filename, filetype) {
    var deferred = Q.defer();

    var headers = {
        'Content-Type': filetype
    };

    var handler = s3.putFile(path,
                             filename,
                             headers,
                             deferred.makeNodeResolver());

    handler.on('progress', function (info) {
        log.info(info.written + '/' + info.total +
                 ' (' + info.percent + '%) uploaded: ' + filename);
    });

    return deferred.promise;
}

exports.saveFile = function (doc, userfile) {
    var deferred = Q.defer();

    var file = new File(doc);

    function onStatusUpdateFail(fileId, newStatus, err) {
        log.error('could not change file ' + fileId +
                  ' status to ' + newStatus + ': ' + err);
    }

    function onUploadSuccess() {
        var status = 'uploaded';
        file.status = status;
        file.save(function (err) {
            if (err) {
                onStatusUpdateFail(file._id, status, err);
                return;
            }
            log.info('changed file ' + file._id + ' status to ' + status);
        });
    }

    function onUploadFail(err) {
        log.error('file ' + file._id + ' upload failed: ' + err);
        var status = 'upload-failed';
        file.status = status;
        file.save(function (err) {
            if (err) {
                onStatusUpdateFail(file._id, status, err);
                return;
            }
            log.info('changed file ' + file._id + ' status to ' + status);
        });
    }

    function onInitialSave(err) {
        if (err) {
            log.error('error saving file to db: ' + err);
            deferred.reject();
            return;
        }
        var filename = file._id + '.' + file.extension;
        saveFileToS3(userfile.path, filename, file.type)
            .then(onUploadSuccess)
            .fail(onUploadFail)
            .done();
        deferred.resolve(file);
    }

    file.save(onInitialSave);

    return deferred.promise;
};
