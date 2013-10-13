'use strict';

require('nodesmartrequire');
var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
var multiGlob = require('multi-glob');
var path = require('path');
var migrations = require('./Migrations');
var fs = require('fs');
var ObjectId = require('mongodb').BSONPure.ObjectID;

var defaultConfig = {
    host: 'localhost',
    db: 'mongoose-migrate',
    port: 27017,
    migrations: './**/*.migration.js',
    template: './lib/MigrationTemplate.js',
    templateOutputDir: './migrations',
    templateSuffix: '.migration.js'

};
exports = module.exports = MongooseMigration;

exports.create = function (name, config, done) {
    config = _.defaults(config || {}, defaultConfig);

    logger.debug(config);

    var template = fs.readFileSync(config.template, 'utf8');
    template = template.replace('<PLACE COLLECTION NAME HERE>', name);
    template = template.replace('<PLACE OBJECT ID HERE>', new ObjectId());
    if(!_.isString(name)){
        name = config.templateSuffix;
    }else{
        name = '-' + name + config.templateSuffix;
    }
    var files = false;
    var paths = config.migrations.split(',');
    multiGlob.glob(paths, function (err, results) {
        files = results;
        filesLoadedFunction();
    });

    var filesLoadedFunction = function () {
        var migrations = migrationsToRun(null, true, files, config);
        var latest = 0;
        if(migrations.length > 0 ){
            latest = fileNumber(path.basename(migrations[migrations.length-1]));
        }
        latest += 1;
        latest = padDigits(latest, 4);
        var output = config.templateOutputDir + '/' + latest +  name;
        logger.debug('Created Migration file', makeBlue(output));
        fs.writeFileSync(output, template, 'utf8');
        if(_.isFunction(done)){
            done();
        }
    };
};

function padDigits(number, digits) {
    return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

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
    var filesLoadedFunction;
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

    function migrateUp(done) {
        logger.debug('Starting Migration', makeBlue('UP'));
        getLatestMigration(function (err, latest) {
            var migrations = migrationsToRun(latest, true, files, config);
            createMigrations(migrations, true, done);
        });
    }

    function migrateDown(done) {
        logger.debug('Starting Migration', makeBlue('DOWN'));
        getLatestMigration(function (err, latest) {
            createMigrations(migrationsToRun(latest, false, files, config), false, done);
        });
    }

    function createMigrations(migrations, up, done) {
        var migration = up ? migrations.shift() : migrations.pop();
        if (migration) {
            var errorMessage = 'Error Migrating';
            var migrate = require(migration);
            var method = up ? migrate.up : migrate.down;
            method.call(migrate, connection, function (err) {
                if (err) {
                    logger.error(errorMessage, err);
                    done(errorMessage, err);
                }
                var base = path.basename(migration);
                var modelMethod = up ? Model.create : Model.remove;
                modelMethod.call(Model, {index: fileNumber(base), name: base }, function (err) {
                    if (err) {
                        logger.error(errorMessage, err);
                        done(errorMessage, error);
                    }
                    var direction = up ? 'UP' : 'DOWN';
                    logger.debug('Migrated', makeBlue(direction + ' ' + base));
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

function makeBlue(message) {
    return '\u001b[36m' + message + '\u001b[39m';
}

function fileNumber(base) {
    return parseInt(base.match(/^\d+/)[0], 10);
}

function migrationsToRun(latest, up, files, config) {
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