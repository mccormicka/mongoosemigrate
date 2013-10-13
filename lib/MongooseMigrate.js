'use strict';

require('nodesmartrequire');
var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
var multiGlob = require('multi-glob');
var path = require('path');
var migrations = require('./Migrations');

var defaultConfig = {
    host: 'localhost',
    db: 'mongoose-migrate',
    port: 27017,
    migrations: './**/*.migration.js'
};

module.exports = MongooseMigration;

function MongooseMigration(mongoose, config, done) {
    if (_.isUndefined(mongoose)) {
        var error = 'You must supply an instance of mongoose to mongoose-migrate';
        logger.error(error);
        throw new Error(error);
    }
    config = _.defaults(config || {}, defaultConfig);
    logger.debug('Initializing Migration', config);

    this.migrateDatabaseUp = function (done) {
        if (!files) {
            filesLoadedFunction = function () {
                migrateUp(done);
            };
        } else {
            migrateUp(done);
        }
    };
    this.migrateDatabaseDown = function (done) {
        if (!files) {
            filesLoadedFunction = function () {
                migrateDown(done);
            };
        } else {
            migrateDown(done);
        }
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    var connection = mongoose.connect(config.host, config.db, config.port, function (err) {
        if (err) {
            logger.error('Error connecting:', err);
        }
        if (_.isFunction(done)) {
            done(err);
        }
    });
    var Model = migrations(connection);
    var files = false;
    var paths = config.migrations.split(',');
    multiGlob.glob(paths, function (err, results) {
        files = results;
        if (_.isFunction(filesLoadedFunction)) {
            filesLoadedFunction();
            filesLoadedFunction = null;
        }
    });

    var filesLoadedFunction;

    function migrateUp(done) {
        logger.debug('Starting Migration', makeBlue('UP'));
        getLatestMigration(function (err, latest) {
            var migrations = migrationsToRun(latest, true);
            createMigrations(migrations, true, done);
        });
    }

    function migrateDown(done) {
        logger.debug('Starting Migration', makeBlue('DOWN'));
        getLatestMigration(function (err, latest) {
            createMigrations(migrationsToRun(latest, false), false, done);
        });
    }

    function createMigrations(migrations, up, done) {
        var migration = migrations.shift();
        if (migration) {
            var errorMessage = 'Error Migrating';
            var migrate = require(migration);
            var method = up ? migrate.up : migrate.down;
            method.call(migrate, connection, function (err) {
                if (err) {
                    logger.error(errorMessage, err);
                    throw new Error(errorMessage, err);
                }
                var base = path.basename(migration);
                var modelMethod = up ? Model.create : Model.remove;
                modelMethod.call(Model, {index: fileNumber(base), name: base }, function (err, success) {
                    if (err) {
                        logger.error(errorMessage, err);
                        throw new Error(errorMessage, error);
                    }
                    var direction = up ? 'UP' : 'DOWN';
                    logger.debug('Migrated', makeBlue( direction + ' ' +  base));
                    createMigrations(migrations, up, done);
                });
            });
        } else {
            logger.debug('Migrations Finished');
            if (_.isFunction(done)) {
                done();
            }
        }
    }

    function makeBlue(message){
        return '\u001b[36m'+ message + '\u001b[39m';
    }

    function fileNumber(base) {
        return parseInt(base.match(/^\d+/)[0], 10);
    }

    function migrationsToRun(latest, up) {
        var start = 0;
        if (latest) {
            start = latest.index;
        }
        var sorted = files.filter(function (file) {
            var base = path.basename(file);
            var formatCorrect = base.match(/^\d+.*\.js$/);
            var migrationNum = formatCorrect && fileNumber(base);
            if (!formatCorrect) {
                logger.error('"' + base + '" ignored. Does not match migration naming schema 0000-' + config.migrations);
                return false;
            }
            return up ? migrationNum > start : migrationNum <= start;
        }).sort();
        return sorted;
    }

    function getLatestMigration(done) {
        Model.latestMigration(function (err, latest) {
            if (err) {
                logger.error('Error finding latest migration', err);
                done(err);
            }
            if (latest) {
                logger.debug('Last Migration was', makeBlue(latest.name));
                done(null, latest);
            } else {
                logger.debug('No previous migrations found');
                done();
            }
        });
    }
}