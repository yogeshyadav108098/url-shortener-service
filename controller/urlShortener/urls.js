'use strict';

const _ = require('lodash');

const UrlsApi = require('../../api/urlShortener/urls');
const LibUtils = require('../../lib/utils').getInstance();
const ResponseCodes = require('../../helpers').responseCode;
const urlShortenerConfig = require('../../config/urlShortener');

const options = {
    table: 'Urls',
    api: UrlsApi
};

const convertorString = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const convertorBase = convertorString.length;

let urls = {
    basic: new (require('../base'))(options),
    custom: {
        encode: function(req, res, next) {
            let lastMiddlewareResult = _.get(req, 'lastMiddlewareResult');

            let encodedString = LibUtils.encode(lastMiddlewareResult.insertId, convertorBase, convertorString);
            let responseMessage = {
                id: encodedString,
                result: 'Encoded successfully'
            };

            _.set(req, 'lastMiddlewareResponse', {
                status: ResponseCodes.OK.status,
                respToSend: responseMessage
            });

            _.set(req, 'lastMiddlewareResult', encodedString);
            return next();
        },

        customizeEncodeResult: function(req, res, next) {
            let encodedString = _.get(req, 'lastMiddlewareResult');
            let result = urlShortenerConfig.basePrefix + '/' + encodedString;

            let responseMessage = {
                encodedString: result,
                result: 'Encoded successfully'
            };

            _.set(req, 'lastMiddlewareResponse', {
                status: ResponseCodes.OK.status,
                respToSend: responseMessage
            });
            return next();
        },

        decode: function(req, res, next) {
            let encodedString = _.get(req, 'body.encodedString');

            let decodedString = LibUtils.decode(encodedString, convertorBase, convertorString);
            req.body = {
                id: decodedString
            };
            return next();
        },

        customizeDecodedResult: function(req, res, next) {
            let lastMiddlewareResult = _.get(req, 'lastMiddlewareResult');
            lastMiddlewareResult = lastMiddlewareResult[0];

            let responseMessage;
            if (!lastMiddlewareResult) {
                responseMessage = {
                    decodedString: undefined,
                    result: 'No such encoded url successfully'
                };
            } else {
                responseMessage = {
                    decodedString: lastMiddlewareResult.url,
                    result: 'Encoded successfully'
                };
            }

            _.set(req, 'lastMiddlewareResponse', {
                status: ResponseCodes.OK.status,
                respToSend: responseMessage
            });
            return next();
        }
    }
};
module.exports = urls;
