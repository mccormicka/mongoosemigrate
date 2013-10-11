'use strict';

var logger = require('nodelogger').Logger(__filename);

module.exports = MongooseMigration;

function MongooseMigration(mongoose, config) {
    if (!config || !config.host || !config.db || !config.migrations) {
        throw new Error('You must pass a configuration object with the follow params {\nhost:hostname, db:dbname, migrations:migrations location }');
    }
}