'use strict';

describe('SHOULD', function () {

    var mockgoose = require('Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var migrations = require('../index');
    var mongoose;
    beforeEach(function (done) {
        mongoose = new Mongoose();
        mockgoose(mongoose);
        migrations(mongoose, {
            host: 'localhost',
            db: 'mongoose-migrate-test',
            migrations: './test'
        });
        mongoose.migrateDatabaseDown(undefined, function () {
            mongoose.migrateDatabaseUp(undefined, done);
        });

    });

    afterEach(function (done) {
        mongoose.migrateDatabaseDown(null, done);
    });

    it('Item should be added to the database', function (done) {
//        var model;// = mongoose.model('testcollection');
//        expect(model).toBeDefined();
//        done();
    });
});