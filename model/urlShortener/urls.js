'use strict';

const DbDefinitions = require('../dbDefinitions');
const DbSlave = DbDefinitions.dbURLShortenerMaster;
const DbMaster = DbDefinitions.dbURLShortenerSlave;
const Config = require('../../config');
const Urls = Config.tables.urlShortener.urls;

let tableOptions = {
    table: Urls,
    db: {
        dbSlave: DbSlave,
        dbMaster: DbMaster
    }
};

let urls = new (require('../baseModel'))(tableOptions);

module.exports = urls;
