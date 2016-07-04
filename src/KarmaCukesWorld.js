/**
 * Karma-Cukes World constructor
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */
(function() {
    
    var supportCode = function() {
        
        this.World = function() {

            this.browser = new KarmaCukesBrowser();

            this.visit = function(url, callback) {
                this.browser.visit(url, callback);
            };

        };
        
        this.When('I go to "$path"', function (path, callback) {
            this.visit(path, callback);
        });
        
    };
    
    module.exports = supportCode;
    
})();
