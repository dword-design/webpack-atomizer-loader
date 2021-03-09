'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Atomizer = require("atomizer");
var cssnano = require("cssnano");
var loader_utils_1 = require("loader-utils");
var postcss_1 = require("postcss");
var utils_1 = require("./utils");
var DEFAULT_CSS_DEST = './build/css/atomic.css';
var DEFAULT_POSTCSS_PLUGIN_LIST = [];
// cached response to prevent unnecessary update
var cachedResponse = '';
var atomizer = new Atomizer({ verbose: true });
// Hash to keep track of config loaded by path
var configObject = {
    default: {
        configs: {
            classNames: []
        }
    }
};
var parseAndGenerateFile = function (config, source, validPostcssPlugins, minimize) {
    if (validPostcssPlugins === void 0) { validPostcssPlugins = []; }
    if (minimize === void 0) { minimize = false; }
    return new Promise(function (resolve, reject) {
        if (config.options && config.options.rules) {
            atomizer.addRules(config.options.rules);
        }
        var foundClasses = atomizer.findClassNames(source);
        var cssDest = config.cssDest || DEFAULT_CSS_DEST;
        if (!utils_1.ensureExists(cssDest)) {
            console.warn('[atomic loader] create css failed.');
            return;
        }
        var finalConfig = atomizer.getConfig(foundClasses, config.configs || {});
        var cssString = atomizer.getCss(finalConfig, config.options || {});
        var pipeline = postcss_1.default(validPostcssPlugins);
        if (minimize) {
            pipeline.use(cssnano());
        }
        pipeline.process(cssString, { from: undefined }).then(function (result) {
            var _a = result.css, css = _a === void 0 ? '' : _a;
            if (css === cachedResponse) {
                return resolve();
            }
            utils_1.writeCssFile(cssDest, css)
                .then(function () {
                cachedResponse = css;
                return resolve();
            })
                .catch(function (err) { return reject(err); });
        });
    });
};
var atomicLoader = function (source, map) {
    var callback = this.async();
    if (this.cacheable) {
        this.cacheable();
    }
    var query = loader_utils_1.getOptions(this) || {};
    var config = query.config, _a = query.configPath, configPath = _a === void 0 ? [] : _a, _b = query.minimize, minimize = _b === void 0 ? false : _b, _c = query.postcssPlugins, postcssPlugins = _c === void 0 ? [] : _c;
    var validPostcssPlugins = DEFAULT_POSTCSS_PLUGIN_LIST;
    if (Array.isArray(postcssPlugins)) {
        validPostcssPlugins = postcssPlugins;
    }
    var configs = []
        .concat(configPath)
        .map(function (configPath) { return require(require.resolve(configPath)); }).concat(config !== undefined ? [query.config] : []);
    if (configs.length === 0) {
        configs.push(configObject.default);
    }
    var tasks = configs.map(function (config) {
        return parseAndGenerateFile(config, source, validPostcssPlugins, minimize);
    });
    Promise.all(tasks)
        .then(function () {
        return callback(null, source);
    })
        .catch(function (err) {
        return callback(err, source);
    });
};
// export default atomicLoader
module.exports = atomicLoader;
