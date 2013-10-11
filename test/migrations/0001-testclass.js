'use strict';

var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

exports.up = function(db, next){
    var tokens = mongodb.Collection(db, 'testcollection');
    tokens.insert({
        'key': '$2a$04$x2jefs5s63LvWzU9i.pReOhXuTqrIopguZgad6g9BUZbOrDuVdVom',
        'secret': '$2a$04$x2jefs5s63LvWzU9i.pReOKDGTFptcIFt2OLp5HS68VnlWYVJSmMW',
        'modelId': '5233974ba9df23ceaf000003',
        'valid': true,
        'type': 'applicationconsumer',
        '_id': new ObjectID('5233974ba9df23ceaf000004'),
        '__v': 0
    }, next);
};

exports.down = function(db, next){
    var tokens = mongodb.Collection(db, 'testcollection');
    tokens.findAndModify({'_id': new ObjectID('5233974ba9df23ceaf000004')}, [], {}, { remove: true }, next);
};
