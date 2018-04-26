'use strict';

const Q = require('q');

const Logger = require('../lib/logger');
const UrlsController = require('./urlShortener');
const ErrorController = require('./common/error');
const ApiDocController = require('./common/apidoc');
const ReadMeGenController = require('./common/readme');
const ResponseController = require('./common/response');
const HealthCheckController = require('./common/healthcheck');
const ValidationController = require('../controller/common/validator');

const filePrefix = 'Main Controller:';
class Controller {
    constructor(options) {
        let self = this;
        let functionPrefix = 'Constructor:';
        Logger.info(filePrefix, functionPrefix, 'Constructing...');

        self.urlShortener = new UrlsController(options, self);

        self.common = {};
        self.common.error = new ErrorController(options, self);
        self.common.apiDoc = new ApiDocController(options, self);
        self.common.readMe = new ReadMeGenController(options, self);
        self.common.response = new ResponseController(options, self);
        self.common.validation = new ValidationController(options, self);
        self.common.healthCheck = new HealthCheckController(options, self);

        Logger.info(filePrefix, functionPrefix, 'Constructed');
        return;
    }

    init(options) {
        let self = this;
        let functionPrefix = 'Init:';
        let deferred = Q.defer();

        new Q(undefined)
            .then(function() {
                Logger.info(filePrefix, functionPrefix, 'Initiating...');
                return Q.resolve();
            })
            .then(function() {
                return self.common.error.init();
            })
            .then(function() {
                return self.common.apiDoc.init();
            })
            .then(function() {
                return self.common.readMe.init();
            })
            .then(function() {
                return self.common.response.init();
            })
            .then(function() {
                return self.common.healthCheck.init();
            })
            .then(function() {
                return self.common.validation.init();
            })
            .then(function() {
                return self.urlShortener.init();
            })
            .then(function() {
                Logger.info(filePrefix, functionPrefix, 'Initiated');
                return deferred.resolve();
            })
            .fail(function(error) {
                return deferred.reject(error);
            });
        return deferred.promise;
    }
}

module.exports = Controller;
