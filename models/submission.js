var mongoose = require('mongoose');
var SubmissionSchema = new mongoose.Schema({ userId : String , problemId : String,language: String, code : String, tot_test : Number, test_passed : Number, points : Number});
var Submission = mongoose.model('Submission', SubmissionSchema);
module.exports = Submission;