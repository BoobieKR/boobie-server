/**
 * @author Jade Yeom
 * @description users model
 */

let mongoose  = require('mongoose'),
    construct = require('mongoose-construct'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    userId: {type: String, unique: true, required: true, match: /[A-Za-z0-9\-_.]{4,16}/},
    userSecret: {type: String, required: true},
    userEmail: {type: String, unique: true, required: true},
    userToken: {type: String, required: true},
    gender : {type : String, enum : ['male', 'female'], required: true},
    memberSince: {type: Date, default: Date.now},

    followers: [String],
    followings: [String],

    userProfile: {
        name: String,
        description: String,
        image: String,
        cover: String,
        followers_count: {type: Number, default: 0, min: 0},
        followings_count: {type: Number, default: 0, min: 0}
    }
});

userSchema.plugin(construct);

module.exports = mongoose.model('User', userSchema);