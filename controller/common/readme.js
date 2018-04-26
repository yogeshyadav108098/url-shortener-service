'use strict';

const Q = require('q');
const _ = require('lodash');
const Logger = require('../../lib/logger');
const Exec = require('child_process').exec;
const ResponseCodes = require('../../helpers').responseCode;

const filePrefix = 'Readme Controller:';
class Readme {
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

    runReadme(req, res, next) {
        Exec('apidoc-markdown -p apiDocs/ -o readme.md', function(error, stdout, stderr) {
            if (error) {
                return next(error);
            }

            let responseMessage = {
                result: 'ReadMe file generated'
            };

            _.set(req, 'lastMiddlewareResponse', {
                status: ResponseCodes.OK.status,
                respToSend: responseMessage
            });

            Logger.info('ReadMe file generated successfully');
            return next();
        });
    }
}

module.exports = Readme;
