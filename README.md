##What is MongooseMigrate?

MongooseMigrate allows you to use database migration with Mongoose.
It's initial purpose was to allow for loading of Mongoose Schema's with default Models into integration tests being run
with [Mockgoose](https://github.com/mccormicka/Mockgoose).
However it can also be used for real Database Migrations too therefore it comes with a [Command Line Interface][CLI] as well as a [Node package][Node].

###Install

MongooseMigrate is currently only available from source until more stable.

    npm install https://github.com/mccormicka/mongoosemigrate/archive/master.tar.gz --save-dev

To run the tests and see what is supported by MongooseMigrate navigate to the MongooseMigrate folder and run the test suite

    npm test

[CLI]: CLI
###CLI 
The Command Line Interface comes with a default configuration of 

    {
        host: 'localhost',
        db: 'mongoose-migrate',
        port: 27017,
        migrations: './**/*.migration.js'
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
      Commands: 
          -up, up                 :Migrates the database upwards 
                                  default:YES 
    
          -down, down             :Migrates the database downwards 
                                  default:NO 
                                  
[Node]: Node
###Node Usage

###Examples
####CLI

    ./bin/mongoose-migrate -host some-ec2-instance -migrations "/**/*.db.js,!./**/test/*.db.js" 

####Node

###CHANGELOG

####0.0.1
Initial Commit