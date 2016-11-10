/**
 * Created by jade on 06/11/2016.
 */

"use strict";

let mongoose = require('mongoose');
let MONGO_URL = 'mongodb://localhost:27017/boobie';

var connectWithRetry = function() {
    mongoose.Promise = global.Promise;
    return mongoose.connect(MONGO_URL, function(err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Success connecting mongo on startup.');
        }
    });
};

connectWithRetry();