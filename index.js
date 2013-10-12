'use strict';

var logger = require('nodelogger').Logger(__filename);

module.exports = require('./lib/MongooseMigrate');
//
//function setupMigrations(mongoose, config){
//
//    /**
//     * Migrate a database upwards using the config.
//     * @param config
//     */
//    mongoose.migrateDatabaseUp = function migrateDatabaseUp(migrateUpTo, callback) {
//        var migrate = connectToMigrations();
//        logger.info('Starting Migration: UP');
//        migrate.run('up', migrateUpTo, callback);
//    };
//
//    /**
//     * Migrate a database downwards using the config.
//     * @param config
//     */
//    mongoose.migrateDatabaseDown = function migrateDatabaseDown(rollBackTo, callback) {
//        var migrate = connectToMigrations();
//        logger.info('Starting Migrations: Down');
//        migrate.run('down', rollBackTo, callback);
//    };
//
////-------------------------------------------------------------------------
////
//// Private Methods
////
////-------------------------------------------------------------------------
//
//    function connectToMigrations() {
//        var migrate = require('mongo-migrate');
//        migrate.setConfigObject(config);
//        migrate.changeWorkingDirectory(config.migrations);
//        return migrate;
//    }
//}