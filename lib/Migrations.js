'use strict';

module.exports = function Migrations(connection) {
    var TYPE = module.filename.slice(__filename.lastIndexOf('/') + 1, module.filename.length - 3);
    return createSchema(connection, TYPE);
};

function createSchema(connection, TYPE) {
    try {
        return connection.model(TYPE);
    } catch (e) {
        var schema = connection.model('____' + TYPE + '____', {}).schema;
        schema.statics.TYPE = TYPE;
        schema.add({
            type: {type: String, 'default': TYPE},
            index: Number,
            name: String,
            migrated: {
                type: Date,
                'default': Date.now()
            }
        });

        schema.statics.latestMigration = function (done) {
            return this.findOne({}, {}, {sort: {index: -1}}, done);
        };

        return connection.model(TYPE, schema);
    }
}