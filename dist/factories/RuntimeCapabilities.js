'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: import and extend the class of the service-framework
// service-framework/dist/RuntimeCapabilities;

var RuntimeCapabilities = function () {
  function RuntimeCapabilities(storageManager) {
    _classCallCheck(this, RuntimeCapabilities);

    if (!storageManager) throw new Error('The Runtime Capabilities need the storageManager');

    this.storageManager = storageManager;
  }

  /**
   * Returns as a promise RuntimeCapabilities json object with all available capabilities of the runtime.
   * If it was not yet persisted in the Storage Manager it collects all required info from the platform and saves in the storage manager.
   * @returns {Promise<object>}
   */


  _createClass(RuntimeCapabilities, [{
    key: 'getRuntimeCapabilities',
    value: function getRuntimeCapabilities() {
      var _this = this;

      return new Promise(function (resolve, reject) {

        Promise.all([_this._getEnvironment(), _this._getMediaDevices()]).then(function (result) {
          var capabilities = {};
          result.forEach(function (capability) {
            Object.assign(capabilities, capability);
          });

          _this.storageManager.set('capabilities', '1', capabilities);

          resolve(capabilities);
        }).catch(function (error) {
          reject(error);
        });
      });
    }

    /**
     * returns as a promise a boolean according to available capabilities.
     * @returns {Promise<boolean>}
     */

  }, {
    key: 'isAvailable',
    value: function isAvailable(capability) {
      var _this2 = this;

      return new Promise(function (resolve) {

        _this2.storageManager.get('capabilities').then(function (capabilities) {

          console.log('Capability ' + capability + ' is available? ', capabilities.hasOwnProperty(capability) && capabilities[capability]);
          if (capabilities.hasOwnProperty(capability) && capabilities[capability]) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }

    /**
     * it refreshes previously collected capabilities and updates the storage manager
     */

  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.getRuntimeCapabilities().then(resolve).catch(reject);
      });
    }

    // TODO: organize the code in separated files

  }, {
    key: '_getEnvironment',
    value: function _getEnvironment() {

      // TODO: this should be more effective and check the environment
      return {
        browser: !!(window && navigator),
        node: !!!(window && navigator)
      };
    }

    // TODO: organize the code in separated files

  }, {
    key: '_getMediaDevices',
    value: function _getMediaDevices() {
      return new Promise(function (resolve) {

        var capability = {};

        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log('enumerateDevices() not supported.');
          resolve(capability);
          return;
        }

        // List cameras and microphones.
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          devices.forEach(function (device) {
            // console.log(device.kind, device.label, device.deviceId);
            if (device.kind === 'audioinput' && device.deviceId === 'default') {
              capability.mic = true;
            }

            if (device.kind === 'videoinput') {
              capability.camera = true;
            }
          });
          resolve(capability);
        }).catch(function (err) {
          resolve(capability);
          console.log(err.name + ': ' + err.message);
        });
      });
    }
  }]);

  return RuntimeCapabilities;
}();

exports.default = RuntimeCapabilities;