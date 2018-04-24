// Update with your config settings.
var pg = require('pg');
pg.defaults.ssl = true;

module.exports = {

    development: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'noahphillips',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'uploads',
            port: process.env.DB_PORT || '5432',
            charset: 'utf8'
        }
    },

    staging: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'noahphillips',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'uploads',
            port: process.env.DB_PORT || '5432',
            charset: 'utf8'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    production: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL,
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};
