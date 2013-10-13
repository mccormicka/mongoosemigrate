##What is MongooseMigrate?

MongooseMigrate allows you to use database migration with Mongoose.
It's initial purpose was to allow for loading of Mongoose Schema's with default Models into integration tests being run
with [Mockgoose](https://github.com/mccormicka/Mockgoose).
However it can also be used for real Database Migrations too therefore it comes with a [Command Line Interface](#cli) as well as a [Node package](#node).

###Install

MongooseMigrate is currently only available from source until more stable.

    npm install https://github.com/mccormicka/mongoosemigrate/archive/master.tar.gz --save-dev

To run the tests and see what is supported by MongooseMigrate navigate to the MongooseMigrate folder and run the test suite

    npm test

###CLI
The Command Line Interface comes with a default configuration of 

    {
        host: 'localhost',
        db: 'mongoose-migrate',
        port: 27017,
        migrations: './**/*.migration.js',
        template: './lib/MigrationTemplate.js',
        templateOutputDir: './migrations',
        templateSuffix: '.migration.js'
    }
any of these values can be overridden by passing one of the options outlined below.

####usage:
     
      Usage ./bin/mongoose-migrate [options] [command]
    
      Options: 
          -h, -help, help         :Show this help screen 
    
          -host, host             :Set the db host name  
                                  default:localhost 
    
          -db, db                 :Set the db name 
                                  default:mongoose-migrate 
    
          -port, port             :Set the db port number 
                                  default:27017 
    
          -migrations, migrations :Set the Glob Pattern for finding migration files 
                                  Glob patterns can be separated by a \ \' comma for 
                                  example -m \'./**/*.migration.js, !./tests/**.js\' 
                                  default:\'./**/*.migration.js\' 
                                  WARNING: You must wrap the glob pattern in quotation marks!  
                                    
          -config, config         :Set path to a .json file that contains the above options 
                                  default:NONE 
                                  
          -template, template     :Set template location for creating new migrations'
                                  default:./lib/MigrationTemplate.js

          -templateOutputDir, templateOutputDir    
                                  :Set template output directory where newly created
                                  migrations will appear.
                                  default:./migrations
                                  WARNING: If the directory does not exist then the creation will fail!
                                
            
      Commands: 
          -up, up                 :Migrates the database upwards 
                                  default:YES 
    
          -down, down             :Migrates the database downwards 
                                  default:NO 
                                  
           -create, create         :Creates a new incremented migration folder from the template
                                    REQUIRED:You must pass the name of the collection to create the template for

###Node
The Node module comes with a default configuration of

    {
        host: 'localhost',
        db: 'mongoose-migrate',
        port: 27017,
        migrations: './**/*.migration.js',
        template: './lib/MigrationTemplate.js',
        templateOutputDir: './migrations',
        templateSuffix: '.migration.js'
    }
any of these values can be overridden by passing an optional configuration object to MongooseMigrate.

###Node Usage
    
    //Require MongooseMigrate
    var MongooseMigrate = require('mongoosemigrate');
    
    //Initialize with a config overriding any defaults
    var migrate = new MongooseMigrate(mongoose, {
            host: 'localhost:8080',
            db: 'mongoose-migrate-test'
        });
    
    //Create a migration template
    MongooseMigrate.create('test', {templateOutputDir:'./test/migrations'}, function(){
        //You will now have a template located at /test/migrations called 0001-test.migration.js that you can edit to use for your tests normally you will use the CLI to create these templates instead of inside Node.js
    });
    
    //Migrate database up
    migrate.migrateDatabaseUp(function(err){
        done();
    });        
    
    //Migrate database down.
    migrate.migrateDatabaseDown(function(){
        done();
    });
        
###Examples
####CLI

    ./bin/mongoose-migrate -host some-ec2-instance -migrations "/**/*.db.js,!./**/test/*.db.js" 
    
    ./bin/mongoose-migrate template ./db.template.js templateOutputDir ./migrations create Users

####Node
    var MongooseMigrate = require('mongoosemigrate');
    
    //Generate a template for our test
    MongooseMigrate.create('test', {templateOutputDir:'./test/migrations'}, function(){
        //You will now have a template located at /test/migrations called 0001-test.migration.js that you can edit to use for your tests normally you will use the CLI to create these templates instead of inside Node.js
    });
    
    var mockgoose = require('mockgoose');//Mock mongoose for testing.
    var Mongoose = require('mongoose').Mongoose;
    var mongoose;
    var migrate;
    
    beforeEach(function(done){
        mongoose = new Mongoose();
        mockgoose(mongoose);//Use Mockgoose
        migrate = new MongooseMigrate(mongoose, {
            host: 'localhost:8080',
            db: 'mongoose-migrate-test'
        });
            
        migrate.migrateDatabaseUp(function(err){
            done();
        });        
    });
    
    afterEach(function(done){
        migrate.migrateDatabaseDown(function(){
            done();
        });
    });
    
    it('Migration should be added to the database', function (done) {
        var Model = mongoose.model('testcollection');
        expect(Model).toBeDefined();
        done();
    });

###CHANGELOG

####0.0.1
Initial Commit