'use strict';

var logger = require('nodelogger').Logger(__filename);
var Migrate = require('./MongooseMigrate');
var Mongoose = require('mongoose').Mongoose;
var _ = require('lodash');

/**
 * Arguments.
 */
var args = process.argv.slice(2);

var config = {
};

var migrated = false;
while (args.length) {
    var arg = args.shift();
    switch (arg) {
    case '-h':
    case '-help':
    case 'help':
        help();
        break;
    case '-config':
    case 'config':
        var json = require(popArg(arg));
        _.defaults(config, json);
        break;
//    case '-configObj':
//    case 'configObj':
//        var conf = popArg(arg);

//        break;
    case '-host':
    case 'host':
        config.host = popArg(arg);
        break;
    case '-db':
    case 'db':
        config.db = popArg(arg);
        break;
    case '-port':
    case 'port':
        config.port = popArg(arg);
        break;
    case '-migrations':
    case 'migrations':
        console.log('ARG', args);
        config.migrations = popArg(arg);
        console.log('Migrations is', config.migrations);
        break;
    case '-up':
    case 'up':
        up();
        migrated = true;
        break;
    case '-down':
    case 'down':
        down();
        migrated = true;
        break;

    default:
        if (arg.match(/^--/)) {
            help();
        }
        break;
    }
}

if (!migrated) {
    up();
}

function connectToMigrate() {
    var migrate = new Migrate(new Mongoose(), config, function (err) {
        if (err) {
            process.exit();
        }
    });
    return migrate;
}
function up() {
    var migrate = connectToMigrate();
    migrate.migrateDatabaseUp(function(){
        process.exit();
    });
}

function down() {
    var migrate = connectToMigrate();
    migrate.migrateDatabaseDown(function(){
        process.exit();
    });
}


function popArg(arg) {
    if (args.length) {
        return args.shift();
    }
    logger.error(arg + ' requires an argument');
    help();
}

function help() {
    logger.info(usage());
    process.exit();
}

function usage() {

    return [
        '',
        '',
        '           ----- MONGOOSE-MIGRATE ------',
        '',
        '   Usage ./bin/mongoose-migrate [options] [command]',
        '',
        '   Options:',
        '       -h, -help, help         :Show this help screen',
        '',
        '       -host, host             :Set the db host name ',
        '                               default:localhost',
        '',
        '       -db, db                 :Set the db name',
        '                               default:mongoose-migrate',
        '',
        '       -port, port             :Set the db port number',
        '                               default:27017',
        '',
        '       -migrations, migrations :Set the Glob Pattern for finding migration files',
        '                               Glob patterns can be separated by a \',\' comma for',
        '                               example -m \'./**/*.migration.js, !./tests/**.js\'',
        '                               default:\'./**/*.migration.js\'',
        '                               \u001b[31mWARNING: You must wrap the glob pattern in quotation marks! \u001b[37m ',
        '',
        '       -config, config         :Set path to a .json file that contains the above options',
        '                               default:NONE',
        '   Commands:',
        '       -up, up                 :Migrates the database upwards',
        '                               default:YES',
        '',
        '       -down, down             :Migrates the database downwards',
        '                               default:NO',
        ''
    ].join('\n');
}
