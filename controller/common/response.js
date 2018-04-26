'use strict';

const Q = require('q');
const _ = require('lodash');

const Logger = require('../../lib/logger');
const ResponseCodes = require('../../helpers').responseCode;

const filePrefix = 'Response Controller:';
class Response {
    constructor(options, controller) {
        let functionPrefix = 'Constructor:';
        Logger.debug(filePrefix, functionPrefix, 'Constructing...');
        return;
    }

    init(options) {
        let functionPrefix = 'Init:';
        Logger.info(filePrefix, functionPrefix, 'Initiating...');
        return Q.resolve();
    }

    setResponse(req, res, next) {
        let functionPrefix = 'Set Response:';
        req.response = _.get(req, 'lastMiddlewareResponse.respToSend', ResponseCodes.INTERNAL_SERVER_ERROR.message);
        req.status = _.get(req, 'lastMiddlewareResponse.status', ResponseCodes.INTERNAL_SERVER_ERROR.status);
        Logger.info(filePrefix, functionPrefix, JSON.stringify(req.response), ', status :', req.status);
        return next();
    }

    sendResponse(req, res, next) {
        let functionPrefix = 'Send Response:';
        if (!req.response || !req.status) {
            return this.sendFailure(next, ResponseCodes.custom({
                message: 'Status is not set till now, yet send Response Called',
                status: ResponseCodes.INTERNAL_SERVER_ERROR.status,
                code: ResponseCodes.INTERNAL_SERVER_ERROR.code
            }));
        }
        Logger.info(filePrefix, functionPrefix, JSON.stringify(req.response), ', status :', req.status);
        Logger.info(req.method, req.url, res.statusCode, req.ip);
        return res.status((req && req.status) || 200).send(req && req.response);
    }

    sendFailure(next, responseCode) {
        let functionPrefix = 'Send Failure:';
        let error = new Error();
        error.message = _.get(responseCode, 'message', ResponseCodes.INTERNAL_SERVER_ERROR.message);
        error.status = _.get(responseCode, 'status', ResponseCodes.INTERNAL_SERVER_ERROR.status);
        error.code = _.get(responseCode, 'code', ResponseCodes.INTERNAL_SERVER_ERROR.code);
        Logger.info(filePrefix, functionPrefix, error.message, ', status :', error.status, ', code :', error.code);
        return next(error);
    }
}

module.exports = Response;
