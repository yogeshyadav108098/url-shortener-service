'use strict';

const Q = require('q');
const AjvModule = require('ajv');
// const Schemas = require('../../schemas');
const Logger = require('../../lib/logger');
const Response = new (require('../common/response'))();
// const SchemaNames = require('../../config/schemaNames');
const ResponseCodes = require('../../helpers').responseCode;

const Ajv = AjvModule({allErrors: true, removeAdditional: 'all'});
const filePrefix = 'Validation Controller:';

class Validator {
    constructor(options, controller) {
        let functionPrefix = 'Constructor:';
        Logger.info(filePrefix, functionPrefix, 'Constructing...');
        return;
    }

    init(options) {
        let functionPrefix = 'Init:';
        Logger.debug(filePrefix, functionPrefix, 'Initiating...');

        // Adding schemas
        // Ajv.addSchema(Schemas.authentication.user.add, SchemaNames.authentication.user.add);


        return Q.resolve();
    }

    errorResponse(schemaErrors) {
        let errors = schemaErrors.map((error) => {
            return error.dataPath + ':' + error.message;
        });
        return errors;
    }

    validateSchema(schemaName) {
        let self = this;
        return (req, res, next) => {
            let valid = Ajv.validate(schemaName, req.body);
            if (!valid) {
                return Response.sendFailure(next, ResponseCodes.custom(
                    'Schema Validation Failed: Errors: ' + JSON.stringify(self.errorResponse(Ajv.errors)),
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                ));
            }
            return next();
        };
    };
}


module.exports = Validator;


