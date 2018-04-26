'use strict';

const {bind} = require('../lib/utils').getInstance();

module.exports = function(app, controllerObject) {
    /**
     * @api {get} /url-shortener/_status Health Check Status
     * @apiName HealthCheckStatus
     * @apiGroup HealthCheck
     *
     * @apiSuccessExample Success-Response:
     * {
     *    result: 'OK'
     * }
     */
    app.get(
        '/url-shortener/_status',
        bind(controllerObject.common.healthCheck, 'healthCheck'),
        bind(controllerObject.common.response, 'setResponse'),
        bind(controllerObject.common.response, 'sendResponse'),
        bind(controllerObject.common.error, 'handleError')
    );

    /**
     * @api {get} /apiDoc API DOC
     * @apiName APIDoc
     * @apiGroup APIDoc
     *
     * @apiSuccessExample Success-Response:
     *   generates html page
     */
    app.get(
        '/apiDoc',
        bind(controllerObject.common.apiDoc, 'runApiDoc'),
        bind(controllerObject.common.apiDoc, 'renderApiDoc'),
        bind(controllerObject.common.error, 'handleError')
    );

    /**
     * @api {get} /readme API DOC
     * @apiName ReadMe
     * @apiGroup Readme
     *
     * @apiSuccessExample Success-Response:
     * {
     *    result: 'ReadMe file generated'
     * }
     */
    app.get(
        '/readme',
        bind(controllerObject.common.apiDoc, 'runApiDoc'),
        bind(controllerObject.common.readMe, 'runReadme'),
        bind(controllerObject.common.response, 'setResponse'),
        bind(controllerObject.common.response, 'sendResponse'),
        bind(controllerObject.common.error, 'handleError')
    );
};
