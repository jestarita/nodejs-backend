'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var paginator = require('mongoose-paginate-v2');
var CommentSchema = Schema({
content: String,
date: { type:Date, default:Date.now },
user: {type: Schema.ObjectId, ref: 'User'}
});

var Comment = mongoose.model('Comment', CommentSchema); 
var topicSchema = Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type:Date, default:Date.now },
    user: {type: Schema.ObjectId, ref: 'User'},
    comments: [CommentSchema]
});

//cargar paginacion 
topicSchema.plugin(paginator);


module.exports = mongoose.model('Topic', topicSchema);

