const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');
let fs = require('fs');

module.exports.initPlugins = function (program) {
  log('plugin registration start');
  try {
    let configJson;
    fs.readFile(program.baseDirectory + '/config/config.json', 'utf8', function (err, data) {
      if (err) {
        error(err);
      }
      configJson = JSON.parse(data);
      if (configJson) {
        // call plugins with before tag
        Object.keys(configJson.plugins).forEach((pluginKey)=>{
          if (configJson.plugins[pluginKey].hasOwnProperty('tag')) {
            if (configJson.plugins[pluginKey].tag === 'before') {
              let initPlugin = require(pluginKey);
              initPlugin.init(program);
            }
          }
        });
      }
    });
  } catch (err) {
    error(err);
  }
};
