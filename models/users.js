/**
 * @author Jade Yeom
 * @description users model
 */

let mongoose  = require('mongoose'),
    construct = require('mongoose-construct'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {type: String, unique: true, required: true, match: /[A-Za-z0-9가-힣\-_.]{4,16}/},
    userSecret: {type: String, required: true},
    userEmail: {type: String, unique: true, required: true},
    userToken: {type: String, required: true},
    userType : {type : String, enum : ['fb', 'kakao', 'email']},
    gender : {type : String, enum : ['male', 'female'], required: true},
    memberSince: {type: Date, default: Date.now},

    userProfile: {
        name: String,
        description: String,
        image: String,
        cover: String,
    }
});

userSchema.plugin(construct);

module.exports = mongoose.model('User', userSchema);