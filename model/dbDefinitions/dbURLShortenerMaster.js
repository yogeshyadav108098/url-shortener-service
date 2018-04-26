'use strict';

const dbUrlShortenerMasterConfigs = {
    development: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlMaster',
        password: 'urlShortenerDbAbBw1308',
        database: 'url-shortener',
        min: 2,
        max: 10
    },

    staging: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlMaster',
        password: 'urlShortenerDbAbBw1308#Software',
        database: 'url-shortener',
        min: 2,
        max: 10
    },

    production: {
        host: 'localhost',
        port: 3306,
        user: 'ShortUrlMaster',
        password: 'urlShortenerDbAbBw1308#Software()!',
        database: 'url-shortener',
        min: 2,
        max: 10
    }
};

const dbUrlShortenerMaster = dbUrlShortenerMasterConfigs[process.env.NODE_ENV || 'development'];
module.exports = require('rc')('dbUrlShortenerMaster', dbUrlShortenerMaster);
