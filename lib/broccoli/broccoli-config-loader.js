'use strict';

var fs     = require('fs');
var path   = require('path');
var Writer = require('broccoli-caching-writer');

function ConfigLoader (inputTree, options) {
  if (!(this instanceof ConfigLoader)) {
    return new ConfigLoader(inputTree, options);
  }

  this.inputTree = inputTree;
  this.options = options || {};
}

ConfigLoader.prototype = Object.create(Writer.prototype);
ConfigLoader.prototype.constructor = ConfigLoader;

ConfigLoader.prototype.clearConfigGeneratorCache = function() {
  var configPath = this.options.project.configPath();

  // clear the previously cached version of this module
  delete require.cache[configPath];
};

ConfigLoader.prototype.updateCache = function(srcDir, destDir) {
  var self = this;

  this.clearConfigGeneratorCache();

  var outputDir = path.join(destDir, 'environments');
  fs.mkdirSync(outputDir);

  var defaultPath = path.join(destDir, 'environment.js');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  var environments = [this.options.env];
  if (this.options.tests) {
    environments.push('test');
  }

  environments.forEach(function(env) {
    var config = self.options.project.config(env);
    var jsonString = JSON.stringify(config);
    var moduleString = 'export default ' + jsonString + ';';
    var outputPath = path.join(outputDir, env);


    fs.writeFileSync(outputPath + '.js',   moduleString, { encoding: 'utf8' });
    fs.writeFileSync(outputPath + '.json', jsonString,   { encoding: 'utf8' });

    if (self.options.env === env) {
      fs.writeFileSync(defaultPath, moduleString, { encoding: 'utf8' });
    }
  }, this);
};

module.exports = ConfigLoader;
