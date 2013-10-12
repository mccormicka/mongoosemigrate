'use strict';

describe('SHOULD', function () {

    var mockgoose = require('Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var MongooseMigrate = require('../index');
    var mongoose;
    var migrate;

    beforeEach(function (done) {
        mongoose = new Mongoose();
//        mockgoose(mongoose);
        migrate = new MongooseMigrate(mongoose, {
            host: 'localhost',
            db: 'mongoose-migrate-test'
        });
        migrate.migrateDatabaseDown(function () {
            migrate.migrateDatabaseUp(done);
        });

    });

    afterEach(function (done) {
        migrate.migrateDatabaseDown(done);
    });

    it('Item should be added to the database', function (done) {
        var Model = mongoose.model('testcollection');
        expect(Model).toBeDefined();
        done();
    });

    it('Item should have migrated values', function (done) {
        var Model = mongoose.model('testcollection');
        Model.findOne({name: 'John'}, function (err, result) {
            expect(err).toBeNull();
            expect(result).toBeDefined();
            if (result) {
                expect(result.name).toBe('John');
            }
            done(err);
        });
    });

    it('Add Migrations to MigrationTable in Mongoose', function (done) {
        var Migrations = mongoose.model('Migrations');
        expect(Migrations).toBeDefined();
        if (Migrations) {
            Migrations.find({}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    expect(results.length).toBe(2);
                    done(err);
                } else {
                    done('Error retrieving migrations');
                }
            });
        } else {
            done('Error creating migrations model');
        }
    });

    it('Items should be run in order', function (done) {
        var Migrations = mongoose.model('Migrations');
        expect(Migrations).toBeDefined();
        if (Migrations) {
            Migrations.find({}, {}, {sort: {index: -1}}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    expect(results[0].index > results[1].index).toBe(true);
                    done(err);
                } else {
                    done('Error retrieving migrations');
                }
            });
        } else {
            done('Error creating migrations model');
        }
    });

    it('Tear down migrations', function (done) {
        migrate.migrateDatabaseUp(function () {
            var Migrations = mongoose.model('Migrations');
            var Model = mongoose.model('testcollection');
            expect(Migrations).toBeDefined();
            expect(Model).toBeDefined();
            migrate.migrateDatabaseDown(function () {
                Migrations.find({}, function (err, migrations) {
                    expect(migrations).toEqual([]);
                    Model.find({}, function (err, models) {
                        expect(models).toEqual([]);
                        done(err);
                    });
                });
            });
        });
    });

    it('Should not load files that do not match the glob pattern', function (done) {
        var Migrations = mongoose.model('Migrations');
        Migrations.count(function(err, count){
            expect(err).toBeNull();
            expect(count).toBe(2);
            done(err);
        });
    });
});