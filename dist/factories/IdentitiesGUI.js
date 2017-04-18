'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// jshint browser:true, jquery: true

var IdentitiesGUI = function () {
  function IdentitiesGUI(identityModule) {
    _classCallCheck(this, IdentitiesGUI);

    if (!identityModule) throw Error('Identity Module not set!');
    var _this = this;
    var guiURL = identityModule._runtimeURL + '/identity-gui';
    _this._guiURL = guiURL;
    _this.identityModule = identityModule;
    _this._messageBus = identityModule.messageBus;
    _this.identityModule.deployGUI();

    _this.resultURL = undefined;

    _this._messageBus.addListener(guiURL, function (msg) {
      var value = void 0;

      _this.showIdentitiesGUI(msg.body.value).then(function (identityInfo) {
        var replyMsg = void 0;

        switch (identityInfo.type) {
          case 'idp':
            value = { type: 'idp', value: identityInfo.value, code: 200 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
            break;

          case 'identity':
            value = { type: 'identity', value: identityInfo.value, code: 200 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
            break;

          default:
            value = { type: 'error', value: 'Error on identity GUI', code: 400 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
        }
      });
    });
  }

  _createClass(IdentitiesGUI, [{
    key: 'showIdentitiesGUI',
    value: function showIdentitiesGUI(receivedInfo) {
      var _this = this;

      return new Promise(function (resolve, reject) {

        var identityInfo = _this.identityModule.getIdentitiesToChoose();

        console.log('identities: ', identityInfo);

        _this.showMyIdentities(identityInfo.identities).then(function (identity) {
          console.log('chosen identity: ', identity);
          resolve({ type: 'identity', value: identity });
        });

        var callback = function callback(value) {
          console.log('chosen identity: ', value);
          resolve({ type: 'identity', value: value });
        };

        var idps = identityInfo.idps;

        _this.obtainNewIdentity(idps[0].domain, callback);
      });
    }
  }, {
    key: 'showMyIdentities',
    value: function showMyIdentities(emails) {
      var _this = this;

      return new Promise(function (resolve, reject) {

        // let identities = _this.identityModule.getIdentities();
        var identities = [];

        for (var i in emails) {
          var domain = emails[i].split('@');
          identities.push({ email: emails[i], domain: domain[1] });
        }

        console.log(identities);

        // resolve(identity);
      });
    }
  }, {
    key: 'createTable',
    value: function createTable() {
      var table = document.createElement('table');
      table.className = 'centered';
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      var thEmail = document.createElement('th');
      thEmail.textContent = 'Email';
      tr.appendChild(thEmail);
      thead.appendChild(tr);
      table.appendChild(thead);
      return table;
    }
  }, {
    key: 'createTableRow',
    value: function createTableRow(identity, toRemoveID) {
      var tr = document.createElement('tr');

      var td = document.createElement('td');
      td.textContent = identity.email;
      td.className = 'clickable-cell';
      td.style = 'cursor: pointer';
      tr.appendChild(td);

      td = document.createElement('td');

      if (toRemoveID) {
        var btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.className = 'remove-id waves-effect waves-light btn';
        td.appendChild(btn);
      }
      tr.appendChild(td);

      return tr;
    }
  }, {
    key: 'changeID',
    value: function changeID(event, callback) {
      var idToUse = event.target.innerText;

      //TODO improve later.
      //prevents when the users selects an hyperty, exit the identity page and goes again to the identity page, from selecting "settings" button as identity.
      if (idToUse !== 'settings') {

        callback(idToUse);
        return idToUse;
      }
    }
  }, {
    key: 'removeID',
    value: function removeID(event, emails) {
      var _this = this;
      var row = event.target.parentNode.parentNode;
      var idToRemove = row.children[0].textContent;
      var domain = row.children[1].textContent;
      _this.identityModule.unregisterIdentity(idToRemove);

      var numEmails = emails.length;
      for (var i = 0; i < numEmails; i++) {
        if (emails[i].email === idToRemove) {
          emails.splice(i, 1);
          break;
        }
      }

      // -------------------------------------------------------------------------//
      _this.showMyIdentities(emails, true);
    }
  }, {
    key: 'obtainNewIdentity',
    value: function obtainNewIdentity(idp, callback) {
      var _this = this;
      var idProvider = idp;
      var idProvider2 = event.target.text;

      _this.identityModule.crypto.generateRSAKeyPair().then(function (keyPair) {

        var publicKey = btoa(keyPair.public);

        _this.identityModule.sendGenerateMessage(publicKey, 'origin', undefined, idProvider).then(function (value) {
          console.log('receivedURL: ' + value.loginUrl.substring(0, 20) + '...');

          var url = value.loginUrl;
          var finalURL = void 0;

          //check if the receivedURL contains the redirect field and replace it
          if (url.indexOf('redirect_uri') !== -1) {
            var firstPart = url.substring(0, url.indexOf('redirect_uri'));
            var secondAuxPart = url.substring(url.indexOf('redirect_uri'), url.length);

            var secondPart = secondAuxPart.substring(secondAuxPart.indexOf('&'), url.length);

            //check if the reddirect field is the last field of the URL
            if (secondPart.indexOf('&') !== -1) {
              finalURL = firstPart + 'redirect_uri=' + location.origin + secondPart;
            } else {
              finalURL = firstPart + 'redirect_uri=' + location.origin;
            }
          }
          _this.resultURL = finalURL || url;

          _this._authenticateUser(keyPair, publicKey, value, 'origin', idProvider).then(function (email) {
            callback(email);
          });
        });
      });
    }
  }, {
    key: '_getList',
    value: function _getList(items) {
      var list = '';
      var numItems = items.length;

      for (var i = 0; i < numItems; i++) {
        list += '<li class="divider"></li>';
        list += '<li><a class="center-align">' + items[i] + '</a></li>';
      }

      return list;
    }
  }, {
    key: '_authenticateUser',
    value: function _authenticateUser(keyPair, publicKey, value, origin, idProvider) {
      var _this = this;
      var url = _this.resultURL;

      return new Promise(function (resolve, reject) {

        _this._openPopup(url).then(function (identity) {

          _this.identityModule.sendGenerateMessage(publicKey, origin, identity, idProvider).then(function (result) {

            if (result) {

              _this.identityModule.storeIdentity(result, keyPair).then(function (value) {
                resolve(value.userProfile.username);
              }, function (err) {
                reject(err);
              });
            } else {
              reject('error on obtaining identity information');
            }
          });
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: '_resetIdentities',
    value: function _resetIdentities() {
      console.log('_resetIdentities');
    }
  }, {
    key: '_openPopup',
    value: function _openPopup(urlreceived) {

      return new Promise(function (resolve, reject) {

        var win = window.open(urlreceived, 'openIDrequest', 'width=800, height=600');
        if (window.cordova) {
          win.addEventListener('loadstart', function (e) {
            var url = e.url;
            var code = /\&code=(.+)$/.exec(url);
            var error = /\&error=(.+)$/.exec(url);

            if (code || error) {
              win.close();
              resolve(url);
            }
          });
        } else {
          var pollTimer = setInterval(function () {
            try {
              if (win.closed) {
                reject('Some error occured when trying to get identity.');
                clearInterval(pollTimer);
              }

              if (win.document.URL.indexOf('id_token') !== -1 || win.document.URL.indexOf(location.origin) !== -1) {
                window.clearInterval(pollTimer);
                var url = win.document.URL;

                win.close();
                resolve(url);
              }
            } catch (e) {
              //console.log(e);
            }
          }, 500);
        }
      });
    }
  }]);

  return IdentitiesGUI;
}();

exports.default = IdentitiesGUI;