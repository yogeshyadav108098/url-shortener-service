'use strict';

const Q = require('q');

const Logger = require('../../lib/logger');

const filePrefix = 'Urls Controller:';
class UrlsController {
    constructor(options, controller) {
        let functionPrefix = 'Constructor:';
        let self = this;

        Logger.info(filePrefix, functionPrefix, 'Constructing...');

        Logger.debug(filePrefix, functionPrefix, 'Constructing urls...');
        self.urls = require('./urls');
    }

    init(options) {
        let functionPrefix = 'Init:';
        Logger.debug(filePrefix, functionPrefix, 'Initiating...');
        return Q.resolve();
    }
}

module.exports = UrlsController;
