'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _runtimeFactory = require('./runtimeFactory');

var _runtimeFactory2 = _interopRequireDefault(_runtimeFactory);

var _minibus = require('runtime-core/dist/minibus');

var _minibus2 = _interopRequireDefault(_minibus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// jshint
// Runtime

window.components = {};
var minibus = new _minibus2.default();

var runtimeProxy = {
  requireHyperty: function requireHyperty(hypertyDescriptor) {

    var from = 'app:requireHyperty';

    return new Promise(function (resolve, reject) {

      var msg = {
        from: from,
        to: 'core:loadHyperty',
        body: {
          value: {
            descriptor: hypertyDescriptor
          }
        }
      };

      minibus._onMessage(msg);

      minibus.addListener(from, function (msg) {
        if (!msg.body.hasOwnProperty('code')) {
          var hypertyURL = msg.body.value.runtimeHypertyURL;
          var hypertyComponent = window.components[hypertyURL];
          var hyperty = {
            runtimeHypertyURL: hypertyURL,
            status: msg.body.value.status,
            instance: hypertyComponent.instance,
            name: hypertyComponent.name
          };

          resolve(hyperty);
        } else {
          reject(msg.body.value);
        }
      });
    });
  },

  requireProtostub: function requireProtostub(domain) {
    var from = 'app:requireProtostub';

    return new Promise(function (resolve, reject) {

      var msg = {
        from: from,
        to: 'core:loadStub',
        body: {
          value: {
            domain: domain
          }
        }
      };

      minibus._onMessage(msg);
      minibus.addListener(from, function (msg) {
        if (!msg.body.hasOwnProperty('code')) {
          var protostubURL = msg.body.value.url || msg.body.value.runtimeProtoStubURL;
          var protostubComponent = window.components[protostubURL];
          var protostub = {
            runtimeProtostubURL: protostubURL,
            status: msg.body.value.status,
            instance: protostubComponent.instance,
            name: protostubComponent.name
          };

          resolve(protostub);
        } else {
          reject(msg.body.value);
        }
      });
    });
  }
};

var rethink = {

  install: function install() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        domain = _ref.domain,
        runtimeURL = _ref.runtimeURL,
        development = _ref.development;

    return new Promise(function (resolve, reject) {

      console.log('Install configuration: ', development, domain, runtimeURL);

      var catalogue = _runtimeFactory2.default.createRuntimeCatalogue(development);

      catalogue.getRuntimeDescriptor(runtimeURL).then(function (descriptor) {

        if (descriptor.sourcePackageURL === '/sourcePackage') {
          return descriptor.sourcePackage;
        } else {
          return catalogue.getSourcePackageFromURL(descriptor.sourcePackageURL);
        }
      }).then(function (sourcePackage) {

        window.eval(sourcePackage.sourceCode);

        var runtime = new Runtime(_runtimeFactory2.default, domain);
        window.runtime = runtime;

        minibus.addListener('core:loadHyperty', function (msg) {
          console.log('Load Hyperty: ', msg);

          var resultMsg = {};
          resultMsg.from = msg.to;
          resultMsg.to = msg.from;
          resultMsg.body = {};

          //TODO: Work the message errors, probably use message factory
          runtime.loadHyperty(msg.body.value.descriptor).then(function (result) {
            resultMsg.body.value = result;
            minibus._onMessage(resultMsg);
          }).catch(function (reason) {
            resultMsg.body.value = reason;
            resultMsg.body.code = 404;
            minibus._onMessage(resultMsg);
          });
        });

        minibus.addListener('core:loadStub', function (msg) {
          console.log('Load Stub:', msg);

          var resultMsg = {};
          resultMsg.from = msg.to;
          resultMsg.to = msg.from;
          resultMsg.body = {};

          //TODO: Work the message errors, probably use message factory
          runtime.loadStub(msg.body.value.domain).then(function (result) {
            resultMsg.body.value = result;
            minibus._onMessage(resultMsg);
          }).catch(function (reason) {
            resultMsg.body.value = reason;
            resultMsg.body.code = 400;
            minibus._onMessage(resultMsg);
          });
        });

        resolve(runtimeProxy);
      }).catch(function (reason) {
        console.error(reason);
        reject(reason);
      });
    });
  }

};

exports.default = rethink;