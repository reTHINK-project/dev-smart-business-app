'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import StorageManagerFake from './StorageManagerFake';

var Dexie = require('dexie');

var runtimeFactory = Object.create({
  createSandbox: function createSandbox() {
    return new _SandboxBrowser2.default();
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
    // Using the implementation of Service Framework
    // Dexie is the IndexDB Wrapper
    var db = new Dexie('cache');
    var storeName = 'objects';

    return new _StorageManager2.default(db, storeName);

    // return new StorageManagerFake('a', 'b');
  },
  persistenceManager: function persistenceManager() {
    var localStorage = window.localStorage;
    return new _PersistenceManager2.default(localStorage);
  },
  createRuntimeCatalogue: function createRuntimeCatalogue(development) {

    if (!this.catalogue) this.catalogue = new _RuntimeCatalogue.RuntimeCatalogue(this);

    return this.catalogue;
  },
  runtimeCapabilities: function runtimeCapabilities(storageManager) {
    return new _RuntimeCapabilities2.default(storageManager);
  }
});

exports.default = runtimeFactory;