var _ = require('underscore');
var Promise = require('bluebird');
var serviceLocator = require('../../service-locator');
var Context = require('../../context');

/**
 * @param {String} id
 * @param {String} type
 * @param {Session} session
 * @constructor
 */
function PluginAbstract(id, type, session) {
  this.id = id;
  this.type = type;
  this.session = session;
}

/**
 * @param {Object} message
 * @returns {Promise}
 */
PluginAbstract.prototype.processMessage = function(message) {
  if (!this.isAllowedMessage(message)) {
    return Promise.reject(message);
  }
  return Promise.resolve(message);
};

/**
 * @param {Object} message
 */
PluginAbstract.prototype.isAllowedMessage = function(message) {
  var isDisallowed = message['janus'] && 'destroy' === message['janus'];
  return !isDisallowed;
};

/**
 * @param {Object} response
 * @returns {Boolean}
 */
PluginAbstract.prototype._isSuccessResponse = function(response) {
  var pluginData = response['plugindata'];
  var hasPluginData = pluginData && pluginData['data'];
  return !!hasPluginData && !pluginData['data']['error'];
};

PluginAbstract.prototype.onRemove = function() {
  serviceLocator.get('logger').info('Removed plugin', this.getContext());
  return Promise.resolve();
};

PluginAbstract.prototype.toString = function() {
  return 'Plugin' + JSON.stringify({
      id: this.id,
      type: this.type
    });
};

/**
 * @returns {Context}
 */
PluginAbstract.prototype.getContext = function() {
  var context = new Context({janus: {pluginId: this.id}});
  if (this.session) {
    context.merge(this.session.getContext());
  }
  return context;
};

module.exports = PluginAbstract;
