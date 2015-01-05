var requestModule = require('request');
var PasswordEncrypt = require('./lib/PasswordEncrypt');
var q = require('q');

var sharedSecret = process.env.SHARED_SECRET;
var encryptedPassword = PasswordEncrypt.encryptPassword(sharedSecret);
var platformUri = process.env.PLATFORM_BASE_URI;

var saveEvent = function (event) {
    var deferred = q.defer();
    var options = {
        url: platformUri + '/rest/events/',
        auth: {
            user: "",
            password: encryptedPassword
        },
        json: {
            'payload': event
        }
    };
    requestModule.post(options, function (error, response) {
        if (!error && response.statusCode == 200) {
            deferred.resolve({status: "ok"});
        } else {
            deferred.reject(error);
        }
    });
    return deferred.promise;
};

exports.saveEvent = saveEvent;