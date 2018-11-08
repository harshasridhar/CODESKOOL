var mongoose = require('mongoose');
var problemCategorySchema = new mongoose.Schema({category: String});
var problemCategory = mongoose.model('problemCategory',problemCategorySchema);
module.exports = problemCategory;