/**
 * Karma-Cukes Step Definitions
 *
 * @author Benjamin Nowack <mail@bnowack.de>
 */

module.exports = function() {

    this.When('I go to "$path"', function (path, callback) {
        this.browser.url(path).then(callback);
    });

    this.Then('I should see "$html" in the "$element" element', function (html, element, callback) {
        var $element = $(this.browser.document).find('html ' + element);
        var haystack = $element.html();
        this.assert.contain(haystack, html, callback, 'should have ' + html + ' in ' + haystack);
    });

    this.Then('the "$element" element should be "$expected"', function (element, expected, callback) {
        var $element = $(this.browser.document).find('html ' + element);
        var actual = $element.html();
        this.assert.equal(actual, expected, callback, actual + ' should be ' + expected);
    });

    this.Then('the response code should be "$code"', function (code, callback) {
        var self = this;
        this.browser
            .getStatusCode()
            .then(function (actualCode) {
                var expectedCode = parseInt(code);
                self.assert.equal(actualCode, expectedCode, callback, 'Code should be "' + expectedCode + '" (was "' + actualCode + '")');
            })
        ;
    });

    this.Then('the response header "$header" should match "$value"', function (header, value, callback) {
        var self = this;
        this.browser
            .getResponseHeader(header)
            .then(function (actualValue) {
                self.assert.ok(actualValue.match(value), callback, 'Header should match "' + value + '" (was "' + actualValue + '")');
            })
        ;
    });

};
