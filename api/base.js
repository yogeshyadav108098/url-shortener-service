'use strict';

const Q = require('q');
const _ = require('lodash');
const Util = require('util');

const Logger = require('../lib/logger');
const EnumStates = require('../model/enum');
const LibUtils = require('../lib/utils').getInstance();
const ResponseCodes = require('../helpers').responseCode;

const filePrefix = 'Base Api:';

class BaseApi {
    constructor(apiOptions) {
        this._filters = apiOptions.filters;
        this._columns = apiOptions.columns;
        this._name = apiOptions.commonName;
        this._updatableColumns = apiOptions.updatableColumns;
        this._model = apiOptions.model;

        let createColumns = [];
        this._columns.forEach(function(column) {
            if (column === 'id') {
                return;
            }
            createColumns.push(column);
        });
        this._createColumns = createColumns;
        this._dbFields = [
            'sum',
            'max',
            'count',
            'limit',
            'offset',
            'beforeId',
            'afterId',
            'columns',
            'distinctColumn',
            'distinctCount',
            'orderBy',
            'patternMatch'
        ];
        this._restrictedColumns = apiOptions.restrictedColumns || {};
        this._patternMatchColumns = apiOptions.patternMatchColumns || [];
        this._filtersOverride = apiOptions.filtersOverride || apiOptions.filters;
    }

    insert(options) {
        const functionPrefix = 'Insert:';
        let deferred = Q.defer();
        let self = this;
        let filterTemp = options.overrideFlag ? self._filtersOverride : self._filters;
        if (options.overrideFlag) {
            delete options.overrideFlag;
        }

        let filters = {
            status: [
                EnumStates.status.DELETED,
                EnumStates.status.INACTIVE,
                EnumStates.status.ACTIVE
            ]
        };

        if (!filterTemp.length) {
            let createOptions = {
                fields: {}
            };

            self._columns.forEach(function(field) {
                if (options[field] !== undefined) {
                    createOptions.fields[field] = options[field];
                }
            });

            if (!Object.keys(createOptions.fields).length) {
                Logger.info(Util.inspect(createOptions));
                return Q.reject(
                    LibUtils.genError(
                        'Fields Missing',
                        ResponseCodes.PRECONDITION_FAILED.status
                    )
                );
            };

            new Q(undefined)
                .then(function() {
                    Logger.info(filePrefix, functionPrefix, JSON.stringify(createOptions));
                    return self._model.insert(createOptions);
                })
                .then(function(result) {
                    return deferred.resolve(result);
                })
                .fail(function(error) {
                    return deferred.reject(error);
                });
        } else {
            let check = filterTemp.some(function(key) {
                return (options[key] === undefined);
            });

            if (check) {
                return Q.reject(
                    LibUtils.genError(
                        'Filters do not match or filters missing',
                        ResponseCodes.PRECONDITION_FAILED.status,
                        ResponseCodes.PRECONDITION_FAILED.code
                    )
                );
            }

            filterTemp.forEach(function(filter) {
                if (options[filter] !== undefined) {
                    filters[filter] = options[filter];
                }
            });

            new Q()
                .then(function() {
                    Logger.info(filePrefix, functionPrefix, JSON.stringify(filters));
                    return self._model.list(filters);
                })
                .then(function(result) {
                    // Rows already exists
                    if (result && result.length > 0) {
                        if (result[0].status) {
                            // Already exists in active state
                            return Q.reject(
                                LibUtils.genError(
                                    'Resource already exists',
                                    ResponseCodes.CONFLICT.status,
                                    ResponseCodes.CONFLICT.code
                                )
                            );
                        } else {
                            // Already exists in inactive state (inactive srate is deleted state,
                            // so can create new)
                            let updateOptions = {};
                            updateOptions.filters = filters;
                            updateOptions.fields = {};

                            self._createColumns.forEach(function(field) {
                                if (options[field] !== undefined) {
                                    updateOptions.fields[field] = options[field];
                                }
                            });

                            updateOptions.fields.status = 1;

                            if (!Object.keys(updateOptions.fields).length) {
                                Logger.info(Util.inspect(updateOptions));
                                return Q.reject(
                                    LibUtils.genError(
                                        'Fields Missing',
                                        ResponseCodes.PRECONDITION_FAILED.status,
                                        ResponseCodes.PRECONDITION_FAILED.code
                                    )
                                );
                            };

                            new Q(undefined)
                                .then(function() {
                                    Logger.info(filePrefix, functionPrefix, JSON.stringify(updateOptions));
                                    return self._model.bulkUpdate(updateOptions);
                                })
                                .then(function(response) {
                                    return deferred.resolve({
                                        insertId: result[0].id,
                                        affectedRows: response,
                                        changedRows: response
                                    });
                                })
                                .fail(function(error) {
                                    return deferred.reject(error);
                                });
                        }
                    } else {
                        let createOptions = {
                            fields: {}
                        };

                        self._createColumns.forEach(function(field) {
                            if (options[field] !== undefined) {
                                createOptions.fields[field] = options[field];
                            }
                        });

                        if (!Object.keys(createOptions.fields).length) {
                            Logger.info(Util.inspect(createOptions));
                            return Q.reject(
                                LibUtils.genError(
                                    'Fields Missing',
                                    ResponseCodes.PRECONDITION_FAILED.status,
                                    ResponseCodes.PRECONDITION_FAILED.code
                                )
                            );
                        };

                        new Q(undefined)
                            .then(function() {
                                Logger.info(filePrefix, functionPrefix, JSON.stringify(createOptions));
                                return self._model.insert(createOptions);
                            })
                            .then(function(result) {
                                return deferred.resolve(result);
                            })
                            .fail(function(error) {
                                return deferred.reject(error);
                            });
                    }
                })
                .fail(function(error) {
                    return deferred.reject(error);
                });
        }
        return deferred.promise;
    };

    delete(options) {
        const functionPrefix = 'Delete:';
        let self = this;
        let deferred = Q.defer();
        new Q(undefined)
            .then(function() {
                Logger.info(filePrefix, functionPrefix, JSON.stringify(options));
                return self._model.delete(options);
            })
            .then(function(result) {
                return deferred.resolve({
                    id: options.id,
                    changedRows: result
                });
            })
            .fail(function(error) {
                return deferred.reject(error);
            });

        return deferred.promise;
    };

    update(options) {
        const functionPrefix = 'Update:';
        let id = options.id;
        let deferred = Q.defer();

        if (!id) {
            return Q.reject(
                LibUtils.genError(
                    'Id do not exist for update',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        }

        let updateOptions = {};
        updateOptions.filters = {
            id: id
        };
        updateOptions.fields = {};

        let self = this;
        self._updatableColumns.forEach(function(field) {
            if (options[field] !== undefined) {
                updateOptions.fields[field] = options[field];
            }
        });

        if (!Object.keys(updateOptions.fields).length) {
            Logger.info(Util.inspect(updateOptions));
            return Q.reject(
                LibUtils.genError(
                    'Fields Missing',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        };

        new Q(undefined)
            .then(function() {
                Logger.info(filePrefix, functionPrefix, JSON.stringify(updateOptions));
                return self._model.bulkUpdate(updateOptions);
            })
            .then(function(result) {
                return deferred.resolve(result);
            })
            .fail(function(error) {
                return deferred.reject(error);
            });

        return deferred.promise;
    };

    list(options, callback) {
        const functionPrefix = 'List:';
        if (!callback) {
            callback = function(error, result) { };
        }

        let deferred = Q.defer();
        if (!options || !Object.keys(options).length) {
            Q.reject(
                LibUtils.genError(
                    'Invalid Object, provide filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );

            return callback(
                LibUtils.genError(
                    'Invalid Object, provide filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        }

        let filters = {};

        let self = this;
        self._columns.forEach(function(field) {
            if (options[field] !== undefined && !_.isObject(options[field])) {
                filters[field] = options[field].toString().split(',');
            } else if (options[field] !== undefined && _.isArray(options[field]) && _.isObject(options[field])) {
                filters[field] = options[field].toString().split(',');
            } else if (options[field] !== undefined) {
                filters[field] = options[field];
            }
        });

        if (!Object.keys(filters).length) {
            Logger.info(Util.inspect(filters));
            Q.reject(
                LibUtils.genError(
                    'Fields missing, provide filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
            return callback(
                LibUtils.genError(
                    'Fields missing, provide filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        };

        self._dbFields.forEach(function(field) {
            if (options[field] !== undefined) {
                filters[field] = options[field];
            }
        });

        Object.keys(self._restrictedColumns).forEach(function(field) {
            if (options[field] === undefined) {
                filters[field] = self._restrictedColumns[field];
            }
        });

        if (options.patternMatch) {
            filters.patternMatch = {};
            self._patternMatchColumns.forEach(function(field) {
                if (options[field] !== undefined) {
                    filters.patternMatch[field] = options[field].toString();
                }
            });
        }

        if (filters.limit < 1) {
            filters.limit = 20;
        }

        if (filters.status === undefined) {
            filters.status = 1;
        }

        new Q(undefined)
            .then(function() {
                Logger.info(filePrefix, functionPrefix, JSON.stringify(filters));
                return self._model.list(filters);
            })
            .then(function(result) {
                deferred.resolve(result);
                return callback(null, result);
            })
            .fail(function(error) {
                deferred.reject(error);
                return callback(error);
            });


        return deferred.promise;
    };

    bulkUpdate(options) {
        const functionPrefix = 'BulkUpdate:';
        let deferred = Q.defer();
        if (!_.get(options, 'filters') || !_.get(options, 'fields')) {
            return Q.reject(
                LibUtils.genError(
                    'Invalid Object, provide fields and filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        }

        let updateOptions = {};
        updateOptions.filters = {};
        updateOptions.fields = {};

        let self = this;
        self._columns.forEach(function(key) {
            if (options.filters[key] !== undefined) {
                updateOptions.filters[key] = options.filters[key];
            }
        });

        if (!Object.keys(updateOptions.filters).length) {
            Logger.info(Util.inspect(updateOptions));
            return Q.reject(
                LibUtils.genError(
                    'Filters Missing, search filters',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        };

        self._updatableColumns.forEach(function(key) {
            if (options.fields[key] !== undefined) {
                updateOptions.fields[key] = options.fields[key];
            }
        });

        if (!Object.keys(updateOptions.fields).length) {
            Logger.info(Util.inspect(updateOptions));
            return Q.reject(
                LibUtils.genError(
                    'Fields Missing, update fields',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        };

        new Q(undefined)
            .then(function() {
                Logger.info(filePrefix, functionPrefix, JSON.stringify(updateOptions));
                return self._model.bulkUpdate(updateOptions);
            })
            .then(function(result) {
                return deferred.resolve(result);
            })
            .fail(function(error) {
                return deferred.reject(error);
            });

        return deferred.promise;
    };
}

module.exports = BaseApi;
