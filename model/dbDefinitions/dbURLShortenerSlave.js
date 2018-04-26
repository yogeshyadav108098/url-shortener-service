'use strict';

const dbUrlShortenerSlaveConfigs = {
    development: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlSlave',
        password: 'urlShortenerDbAbBw1308',
        database: 'url-shortener',
        min: 2,
        max: 10
    },

    staging: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlSlave',
        password: 'urlShortenerDbAbBw1308#Software',
        database: 'url-shortener',
        min: 2,
        max: 10
    },

    production: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlSlave',
        password: 'urlShortenerDbAbBw1308#Software()!',
        database: 'url-shortener',
        min: 2,
        max: 10
    }
};

const dbUrlShortenerSlave = dbUrlShortenerSlaveConfigs[process.env.NODE_ENV || 'development'];

module.exports = require('rc')('dbUrlShortenerSlave', dbUrlShortenerSlave);
