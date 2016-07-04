/**
 * Patch for module.exports
 * 
 * This patch provides access to all modules set via `module.exports = ...` (w/o executing them),
 * so that CucumberJS support code can be re-used as-is.
 */
(function() {
    
    var module = window.module = {};
    var exports = [];

    Object.defineProperty(module, 'exports', {
        
        set: function(exported) {
            exports.push(exported);
        },
        
        get: function () {
            return exports;
        }
        
    });
    
})();
