/**
 * Created by jade on 06/11/2016.
 */
let jwt = require('jsonwebtoken');

exports.generateToken = function (userId) {
    return jwt.sign({'userId': userId}, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1440m'
    });
};

//TODO generateHash function for users password encrypt