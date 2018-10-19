var mongoose = require('mongoose');
var ProblemSchema = new mongoose.Schema({id : Number,tags : [String], pstatement : {type : String, unique : true}, constraints : String, test_cases : Number, inp : [String], out : [String]  });  
var Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;