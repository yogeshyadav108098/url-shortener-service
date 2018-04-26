'use strict';

const Logger = require('./logger');

const filePrefix = 'Utils:';
class Utils {
    constructor() {
        const functionPrefix = 'Constructor:';
        Logger.info(filePrefix, functionPrefix, 'Constructing Lib Utilities...');
    }

    bind(object, functionName) {
        const functionPrefix = 'Bind:';
        Logger.debug(filePrefix, functionPrefix, 'Function', functionName);
        return object[functionName].bind(object);
    }

    genError(message, status, code) {
        let error = new Error(message || 'Unexpected error occurred, Please report');
        error.status = status ? status : 500;
        error.code = code;
        return error;
    }

    randomGenerate(min, max) {
        return Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
    }

    encode(number, convertorBase, convertorString) {
        let functionPrefix = 'Encode:';
        number = Number(number);
        Logger.debug(filePrefix, functionPrefix, 'Encoding', number, 'on basis of string', convertorString);
        let encodedString = '';
        while (number) {
            let remainder = number % convertorBase;
            number = Math.floor(number / convertorBase);
            encodedString = convertorString[remainder].toString() + encodedString;
        }

        Logger.debug(filePrefix, functionPrefix, 'Encoded to', encodedString);
        return encodedString;
    }

    decode(encodedString, convertorBase, convertorString) {
        let functionPrefix = 'Decode:';
        let number = 0;
        Logger.debug(filePrefix, functionPrefix, 'Decoding', encodedString);
        while (encodedString) {
            let index = convertorString.indexOf(encodedString[0]);
            let power = encodedString.length - 1;
            number += index * (Math.pow(convertorBase, power));
            encodedString = encodedString.substring(1);
        }
        Logger.debug(filePrefix, functionPrefix, 'Decoded to', number);
        return number;
    }
}

let utilsInstance;
module.exports.getInstance = function() {
    if (!utilsInstance) {
        utilsInstance = new Utils();
    }

    return utilsInstance;
};
