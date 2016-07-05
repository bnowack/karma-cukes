
/**
 * Patches Error.captureStackTrace in browsers such as Firefox or PhantomJS
 * 
 * @param {Object} obj - Error object
 */
Error.captureStackTrace = Error.captureStackTrace || function (error) {
    if (Error.prepareStackTrace) {
        var frame = {
            isEval: function () {
                return false;
            },
            getFileName: function () {
                return "unknown";
            },
            getLineNumber: function () {
                return 0;
            },
            getColumnNumber: function () {
                return 0;
            },
            getFunctionName: function () {
                return "unknown";
            }
        };
        error.stack = Error.prepareStackTrace(error, [frame, frame, frame]);
    } else {
        error.stack = error.stack || error.name || "Error";
    }
};
