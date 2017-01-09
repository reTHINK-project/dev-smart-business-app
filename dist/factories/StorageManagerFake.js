'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import StorageManager from 'service-framework/dist/StorageManager';

var StorageManagerFake = function () {
  function StorageManagerFake() {
    _classCallCheck(this, StorageManagerFake);

    var store = new Map();
    this.store = store;
  }

  _createClass(StorageManagerFake, [{
    key: 'set',
    value: function set(key, version, value) {
      var _this = this;

      console.log('[Service Framework] - Set:', key, version, value);
      return new Promise(function (resolve, reject) {
        try {
          resolve(_this.store.set(key, { version: version, value: value }));
        } catch (e) {
          resolve(e);
        }
      });
    }
  }, {
    key: 'get',
    value: function get(key) {
      var _this2 = this;

      console.log('[Service Framework] - Get:', key);
      return new Promise(function (resolve, reject) {
        console.log('GET:', _this2.store.get(key));
        try {
          resolve(_this2.store.get(key));
        } catch (e) {
          resolve(undefined);
        }
      });
    }
  }, {
    key: 'getVersion',
    value: function getVersion(key) {
      var _this3 = this;

      console.log('[Service Framework] - Get Version:', key);
      return new Promise(function (resolve, reject) {
        console.log('GET:', _this3.store.get(key));
        try {
          resolve(_this3.store.get(key).version);
        } catch (e) {
          resolve(undefined);
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(key) {
      var _this4 = this;

      console.log('[Service Framework] - Delete:', key);
      return new Promise(function (resolve, reject) {
        try {
          resolve(_this4.store.delete(key));
        } catch (e) {
          resolve(e);
        }
      });
    }
  }]);

  return StorageManagerFake;
}();

exports.default = StorageManagerFake;