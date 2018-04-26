'use strict';

const {bind} = require('../lib/utils').getInstance();

module.exports = function(app, controllerObject) {
    /**
     * @api {get} /url-shortener/shorten Health Check Status
     * @apiName Shorten
     * @apiGroup UrlShortener
     *
     * @apiParam {String} url Url to shorten
     *
     * @apiSuccessExample Success-Response:
     * {
     *    result: encodedUrl
     * }
     */
    app.post(
        '/url-shortener/encode',
        bind(controllerObject.urlShortener.urls.basic, 'create'),
        bind(controllerObject.urlShortener.urls.custom, 'encode'),
        bind(controllerObject.urlShortener.urls.custom, 'customizeEncodeResult'),
        bind(controllerObject.common.response, 'setResponse'),
        bind(controllerObject.common.response, 'sendResponse'),
        bind(controllerObject.common.error, 'handleError')
    );

    app.post(
        '/url-shortener/decode',
        bind(controllerObject.urlShortener.urls.custom, 'decode'),
        bind(controllerObject.urlShortener.urls.basic, 'list'),
        bind(controllerObject.urlShortener.urls.custom, 'customizeDecodedResult'),
        bind(controllerObject.common.response, 'setResponse'),
        bind(controllerObject.common.response, 'sendResponse'),
        bind(controllerObject.common.error, 'handleError')
    );
};
