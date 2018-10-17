var mongoose = require('mongoose');
var ProblemSchema = new mongoose.Schema({id : Number,tags : [String], p_statement : String  });  
var Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;