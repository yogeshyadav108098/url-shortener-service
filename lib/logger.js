'use strict';

const Os = require('os');
const _ = require('lodash');
const Logger = new (require('uuid-logger'))();

let LogPath = _.get(process.env, 'LOG_PATH');
let LogLevel = _.get(process.env, 'LOG_LEVEL');
let LogFile = _.get(process.env, 'LOG_FILE');

let hostname = Os.hostname();

// Add file transport default
Logger.addTransport({
    file: {
        fileName: LogFile,
        filePath: LogPath,
        level: LogLevel,
        colorize: false,
        json: false,
        zippedArchive: true,
        maxDays: 15
    }
});

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    Logger.addTransport({
        console: {
            level: 'debug',
            colorize: true
        }
    });
}

Logger.addTransport({
    slack: {
        webHookUrl: 'https://hooks.slack.com/services/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',
        channel: '#url-shortener-prod',
        username: hostname.slice(0, 17) + ' - ErrorBot',
        level: 'error'
    }
});


module.exports = Logger.getLogger();
