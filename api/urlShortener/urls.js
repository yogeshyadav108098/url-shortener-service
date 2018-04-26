'use strict';

const Config = require('../../config');
const UrlsModel = require('../../model/urlShortener/urls');
const UrlsTable = Config.tables.urlShortener.urls;
let urls = {
    basic: new (require('../base'))({
        filters: UrlsTable.FILTERS,
        columns: UrlsTable.COLUMNS,
        updatableColumns: UrlsTable.UPDATABLE_COLUMNS,
        restrictedColumns: UrlsTable.RESTRICTED_COLUMNS,
        patternMatchColumns: UrlsTable.PATTERN_MATCH_COLUMNS,
        model: UrlsModel,
        commonName: UrlsTable.COMMON_NAME
    }),
    custom: {
    }
};

module.exports = urls;
