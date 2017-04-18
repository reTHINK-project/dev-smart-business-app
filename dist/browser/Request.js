'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methods = { GET: 'get', POST: 'post', DELETE: 'delete', UPDATE: 'update' };

var Request = function () {
  function Request() {
    var _this = this;

    _classCallCheck(this, Request);

    this._withCredentials = false;

    Object.keys(methods).forEach(function (method) {

      switch (method) {

        case 'GET':
          _this[methods[method]] = function (url) {
            return _this._makeLocalRequest(method, url);
          };

          break;

        case 'POST':
        case 'DELETE':
        case 'UPDATE':
          _this[methods[method]] = function (url) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _this._makeLocalRequest(method, url, options);
          };
          break;
      }
    });
  }

  _createClass(Request, [{
    key: '_makeLocalRequest',
    value: function _makeLocalRequest(method, url, options) {
      var _this2 = this;

      if (!options) {
        options = null;
      }

      console.log('method:', method, '| url: ', url, options ? ' | payload:' + options : '');

      return new Promise(function (resolve, reject) {
        var protocolmap = {
          'hyperty-catalogue://': 'https://',
          'https://': 'https://',
          'http://': 'https://'
        };

        var foundProtocol = false;
        for (var protocol in protocolmap) {
          if (url.slice(0, protocol.length) === protocol) {
            // console.log("exchanging " + protocol + " with " + protocolmap[protocol]);
            url = protocolmap[protocol] + url.slice(protocol.length, url.length);
            foundProtocol = true;
            break;
          }
        }

        if (!foundProtocol) {
          reject('Invalid protocol of url: ' + url);
          return;
        }

        var xhr = void 0;
        if (!_this2.xhr) {
          xhr = new XMLHttpRequest();
          xhr.withCredentials = _this2._withCredentials;
          _this2.xhr = xhr;
        } else {
          xhr = _this2.xhr;
        }

        xhr.addEventListener('readystatechange', function (event) {
          var xhr = event.currentTarget;
          if (xhr.readyState === 4) {
            // console.log("got response:", xhr);
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              // console.log("rejecting promise because of response code: 200 != ", xhr.status);
              reject(xhr.responseText);
            }
          }
        });

        xhr.open(method, url);

        if (method === 'POST') {
          /*
          xhr.setRequestHeader('content-type', 'application/json');
          xhr.setRequestHeader('cache-control', 'no-cache');
          */
          xhr.send(options);
        } else {
          xhr.send();
        }
      });
    }
  }, {
    key: 'withCredentials',
    set: function set() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this._withCredentials = value;
    },
    get: function get() {
      return this._withCredentials;
    }
  }]);

  return Request;
}();

exports.default = Request;