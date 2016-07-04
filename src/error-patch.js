
/**
 * Adds missing Error.captureStackTrace to browsers such as Firefox or PhantomJS
 * 
 * @param {Object} obj - Error object
 */
Error.captureStackTrace = Error.captureStackTrace || function (obj) {
    if (Error.prepareStackTrace) {
        var frame = {
            isEval: function () {
                return false;
            },
            getFileName: function () {
                return "filename";
            },
            getLineNumber: function () {
                return 1;
            },
            getColumnNumber: function () {
                return 1;
            },
            getFunctionName: function () {
                return "functionName";
            }
        };
        obj.stack = Error.prepareStackTrace(obj, [frame, frame, frame]);
    } else {
        obj.stack = obj.stack || obj.name || "Error";
    }
};
