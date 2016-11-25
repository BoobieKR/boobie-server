/**
 * Created by jade on 06/11/2016.
 */
let jwt = require('jsonwebtoken'),
    User = require('../models/users');

exports.generateToken = function (userId) {
    return jwt.sign({'userId': userId}, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1440m'
    });
};

exports.isVerifyToken = function (userToken, handleQuery) {
    User.findOne({'userToken': userToken}, function (err, user){
        handleQuery(err, user);
        if (!err) {
            if (user) {
                return user;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
}

//TODO generateHash function for users password encrypt