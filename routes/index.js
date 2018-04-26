'use strict';

module.exports = function(app, controllerObject) {
    // Add shortening Routes
    require('./urlShortener')(app, controllerObject);

    // Add Common Routes
    require('./common')(app, controllerObject);
};
