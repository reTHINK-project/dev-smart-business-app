'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _WindowSandbox = require('../sandboxes/WindowSandbox');

var _WindowSandbox2 = _interopRequireDefault(_WindowSandbox);

var _SandboxBrowser = require('../sandboxes/SandboxBrowser');

var _SandboxBrowser2 = _interopRequireDefault(_SandboxBrowser);

var _AppSandboxBrowser = require('../sandboxes/AppSandboxBrowser');

var _AppSandboxBrowser2 = _interopRequireDefault(_AppSandboxBrowser);

var _Request = require('../browser/Request');

var _Request2 = _interopRequireDefault(_Request);

var _RuntimeCatalogue = require('service-framework/dist/RuntimeCatalogue');

var _PersistenceManager = require('service-framework/dist/PersistenceManager');

var _PersistenceManager2 = _interopRequireDefault(_PersistenceManager);

var _StorageManager = require('service-framework/dist/StorageManager');

var _StorageManager2 = _interopRequireDefault(_StorageManager);

var _RuntimeCapabilities = require('./RuntimeCapabilities');

var _RuntimeCapabilities2 = _interopRequireDefault(_RuntimeCapabilities);

var _dexie = require('dexie');

var _dexie2 = _interopRequireDefault(_dexie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var runtimeFactory = Object.create({
  createSandbox: function createSandbox(capabilities) {
    var _this = this;

    return new Promise(function (resolve) {

      var sandbox = void 0;
      var isWindowSandbox = '';
      var SandboxCapabilities = {};
      if (capabilities.hasOwnProperty('windowSandbox') && capabilities.windowSandbox) isWindowSandbox = 'windowSandbox';

      // TODO this should be corrected.. now is only for testing
      _this.capabilitiesManager.isAvailable(isWindowSandbox).then(function (result) {
        if (result) {
          // TODO: to be retrieved from capabilitiesManager
          SandboxCapabilities = { "windowSandbox": true };

          console.info('[createSandbox ] - windowSandbox');
          sandbox = new _WindowSandbox2.default(SandboxCapabilities);
        } else {
          console.info('[createSandbox ] - sandbox');
          sandbox = new _SandboxBrowser2.default(SandboxCapabilities);
        }

        resolve(sandbox);
      }).catch(function (reason) {
        console.log('[createSandbox ] By default create a normal sandbox: ', reason);
        console.info('[createSandbox ] - sandbox');
        sandbox = new _SandboxBrowser2.default(capabilities);

        resolve(sandbox);
      });
    });
  },
  createAppSandbox: function createAppSandbox() {
    return new _AppSandboxBrowser2.default();
  },
  createHttpRequest: function createHttpRequest() {
    var request = new _Request2.default();
    return request;
  },
  atob: function (_atob) {
    function atob(_x) {
      return _atob.apply(this, arguments);
    }

    atob.toString = function () {
      return _atob.toString();
    };

    return atob;
  }(function (b64) {
    return atob(b64);
  }),
  storageManager: function storageManager() {

    if (!this.storage) {
      // Using the implementation of Service Framework
      // Dexie is the IndexDB Wrapper
      var db = new _dexie2.default('cache');
      var storeName = 'objects';
      this.storage = new _StorageManager2.default(db, storeName);
    }

    return this.storage;
  },
  persistenceManager: function persistenceManager() {
    if (!this.localStorage) {
      window.localStorage;
      this.localStorage = new _PersistenceManager2.default(localStorage);
    }

    return this.localStorage;
  },
  createRuntimeCatalogue: function createRuntimeCatalogue() {

    if (!this.catalogue) {
      this.catalogue = new _RuntimeCatalogue.RuntimeCatalogue(this);
    }

    return this.catalogue;
  },
  runtimeCapabilities: function runtimeCapabilities() {
    if (!this.capabilitiesManager) {
      this.capabilitiesManager = new _RuntimeCapabilities2.default(this.storage);
    }

    return this.capabilitiesManager;
  }
});

// import StorageManagerFake from './StorageManagerFake';

exports.default = runtimeFactory;