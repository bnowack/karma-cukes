# Karma-Cukes

Karma plugin for running Gherkin feature files against CucumberJS in end-to-end tests.

## Idea

[Karma](http://karma-runner.github.io/) is a developer-friendly tool for running tests in real browsers,
with direct access to client-side markup and code (i.e. without a Selenium wire).
[CucumberJS](https://github.com/cucumber/cucumber-js) enables end-to-end tests and stakeholder-friendly, 
living documentation.

Bringing these two together can simplify the development workflow from spec to story through a compact set 
of tools.

#### Main features

* Comes bundled with "Progress", "Pretty", and "JSON" reporters that are more in line with 
  the official Cucumber reporters (no HTML reporter yet, this package is more targeted at command-line users).
* The API for registering step definitions and other support code is compatible to CucumberJS.
* Native access to the browser, jQuery, etc.
* A single toolkit for both Story BDD and Spec BDD.
* Tested with Chrome, Firefox, PhantomJS


### Existing alternatives

#### Selenium/Webdriver with built-in CucumberJS framework

While Webdriver (Selenium) offers near-out-of-the-box support for Cucumber, the generated reports 
lack the level of detail that "native" Cucumber provides. They don't allow to auto-generate
living documentation from report files (e.g. feature descriptions are missing and both feature and
scenario names get normalized to underscored identifiers).

#### Other Karma-CucumberJS adapters

They basically have the same issues as Webdriver-Cucumber. There are usable jUnit-reporters but no
proper "Progress", "Pretty", or "JSON" formatters that behave like the ones a Cucumber developer is 
used to.

### Solution

The two main options were:

* writing a custom adapter + custom Cucumber-compatible reporters for Webdriver, or
* writing a custom adapter + custom Cucumber-compatible reporters for Karma.

This package goes for the second option, which –from looking at available adapters—,
seemed to be the lower-hanging fruit. (I'm not so sure about this anymore, though. 
Webdriver.io definitely does a better job regarding developer documentation and code 
style).

#### Limitations compared to Webdriver

* Only PhantomJS offers an API for [taking screenshots](http://stackoverflow.com/a/34695107)
  through Karma (AFAIK), while Webdriver provides this feature for all browsers.

* The Karma Browser launchers are not fully standardized, e.g. PhantomJS and Firefox do not 
  report step locations correctly (they are all set to "filename:1").

* There is only a minimal Browser API for visiting URLs and accessing a XHR object in end-to-end
  tests. The rest is native browser access and up to you.

* No access to response headers (except for AJAX-based requests), 
  but could be doable via [Service Workers](https://github.com/gmetais/sw-get-headers)

* For each non-CORS-enabled target server to be used in end-to-end tests, a proxy needs to 
  be defined in the Karma configuration file.


## Installation

    npm install karma-cukes --save-dev

(Peer dependencies: `jquery`, `cucumber`, and `colors`)

## Configuration (karma.conf.js)

    config.set({

        // activate framework
        frameworks: ['karma-cukes'],

        // specify feature files and support code
        files: [
            { pattern: 'dev/**/*.feature', included: false },
            'dev/**/step-definitions.js',
            'dev/**/hooks.js'
        ],

        // forward command line arguments to CucumberJS
        client: {
            args: process.argv.slice(4),
        },

        // activate reporters (kc-progress, kc-pretty, and/or kc-json)
        reporters: ['kc-pretty', 'kc-json'],
        
        // configure the JSON formatter
        kcJsonReporter: {
            outputDir: 'dev/reports/behaviour',
            outputFile: 'karma-cukes-{shortBrowserName}.json' // supported placeholders: shortBrowserName, browserName
        },
        
        // enable colors in the output
        colors: true,

        // proxy test server for end-to-end testing
        proxies: {
            "/": "http://localhost:8889/"
        },
        
        // use a root URL for the karma runner that does not interfere with proxied sites
        urlRoot: "/__karma__/",

        ...

    })

## Running features

    // all scenarios
    $ ./node_modules/.bin/karma start path/to/karma.conf.js

    // tagged scenarios
    $ ./node_modules/.bin/karma start path/to/karma.conf.js -- --tags @ui

