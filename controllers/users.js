/**
 * Created by jade on 06/11/2016.
 */
let User = require('../models/users'),
    secure = require('../libs/secure');

exports.signUp = function (req, res) {

    if (!req.body.userId || !req.body.userEmail || !req.body.userSecret) {
        res.status(400).send(_status.less_parameter);
    } else {
        User.findOne({userId: req.body.userId}, function (err, user) {
            if (err) {
                return res.status(500).send(_status.failed);
            }
            if (user) {
                return res.status(400).send(_status.already_exists);
            } else {
                new User({
                    userId: req.body.userId,
                    userSecret: req.body.userSecret,
                    userEmail: req.body.userEmail,
                    userToken: secure.generateToken(req.body.userId)
                }).save(user).then(function (doc) {
                    return res.status(201).send(_status.created);
                });
            }
        });
    }
};

exports.signIn = function (req, res) {

    if (!req.query.userEmail || !req.query.userSecret) {
        console.log(req.query.userEmail);
        console.log(req.query.userSecret);
        res.status(400).send(_status.less_parameter);
    } else {
        User.findOne({userEmail: req.query.userEmail}, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                res.status(404).send(_status.not_found);
            } else {
                if (user.userSecret == req.query.userSecret) {
                    var resultJSON = _status.succeed;
                    resultJSON.data = user;
                    res.status(200).send(resultJSON);
                } else {
                    res.status(403).send(_status.invalid_email)
                }
            }
        });
    }
};
