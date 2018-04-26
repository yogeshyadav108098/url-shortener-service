'use strict';

const Q = require('q');
const _ = require('lodash');
const Request = require('request');

const Logger = require('../../lib/logger');
const Response = new (require('./response'))();
const Endpoints = require('../../config/endpoints');
const ResponseCodes = require('../../helpers').responseCode;
const AllowedOrigins = require('../../config/allowedOrigin');

const filePrefix = 'Auth Controller:';
class AuthController {
    constructor(options, controller) {
        let functionPrefix = 'Constructor:';
        Logger.info(filePrefix, functionPrefix, 'Constructing...');
        return;
    }

    init(options) {
        let functionPrefix = 'Init:';
        Logger.debug(filePrefix, functionPrefix, 'Initiating...');
        return Q.resolve();
    }

    hasPermission(permissionName, entityType = 'ADMIN', entityId = '0') {
        const functionPrefix = 'HasPermission:';
        return function(req, res, next) {
            let accessToken = _.get(req, 'headers.accesstoken') || _.get(req, 'headers.accessToken');
            if (!accessToken) {
                Logger.debug(filePrefix, functionPrefix, 'No access token provided');
                return Response.sendFailure(next, ResponseCodes.NO_TOKEN_USER_UNAUTHORIZED);
            }

            let requestOptions = {
                url: Endpoints.HOST.ACL + Endpoints.ROUTES.HAS_PERMISSION,
                method: Endpoints.ROUTES_CONFIG.HAS_PERMISSION.REQUEST_TYPE,
                timeout: Endpoints.ROUTES_CONFIG.HAS_PERMISSION.TIMEOUT,
                headers: {
                    accesstoken: accessToken
                },
                json: {
                    permissionName: permissionName,
                    entityType: entityType,
                    entityId: entityId
                }
            };

            Logger.info(
                filePrefix,
                functionPrefix,
                JSON.stringify(requestOptions)
            );
            Request(requestOptions, function(error, response, body) {
                if (error) {
                    Logger.error(filePrefix, functionPrefix, error);
                    return Response.sendFailure(next, ResponseCodes.OAUTH_SERVER_NOT_ACCESSIBLE);
                }

                Logger.info(filePrefix, functionPrefix, 'Status Code:', response.statusCode);
                if ([200, 304].indexOf(response.statusCode) < 0) {
                    return Response.sendFailure(next, ResponseCodes.USER_UNAUTHORIZED);
                }

                Logger.info(filePrefix, functionPrefix, 'Body:', JSON.stringify(body));
                try {
                    body = JSON.parse(body);
                } catch (error) {
                    Logger.error(error);
                }

                if (!body.associated) {
                    Logger.info(filePrefix, functionPrefix, 'User is not authorized as associated variable is not set');
                    return Response.sendFailure(next, ResponseCodes.USER_UNAUTHORIZED);
                }

                return next();
            });
        };
    }


    setCorsHeaders(req, res, next) {
        // Check if request is originating from a domain we want to allow
        let requestDomain = req.headers.origin;
        AllowedOrigins.forEach((allowedOrigin) => {
            if (requestDomain === allowedOrigin) {
                res.header('Access-Control-Allow-Origin', requestDomain);
            }
        });
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header(
            'Access-Control-Allow-Headers',
            'origin, sso_token, sso_token_enc,' +
            ' content-type, accept, authorization,' +
            ' authorization, cache-control, credentials,' +
            ' x-xsrf-token, x-csrf-token'
        );

        if (req.method === 'OPTIONS') {
            return res.send(200);
        }
        return next();
    }
}

module.exports = AuthController;
