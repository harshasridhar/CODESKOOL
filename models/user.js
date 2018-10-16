var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({ userName: String, password : String,email : String, preferences : [String]});
UserSchema.statics.hash=function(password){
}
UserSchema.statics.hash = function(s) {
    var a = 1, c = 0, h, o;
    if (s) {
        a = 0;
        /*jshint plusplus:false bitwise:false*/
        for (h = s.length - 1; h >= 0; h--) {
            o = s.charCodeAt(h);
            a = (a<<6&268435455) + o + (o<<14);
            c = a & 266338304;
            a = c!==0?a^c>>21:a;
        }
    }
    return String(a);
};
var User = mongoose.model('User',UserSchema);
module.exports = User;
