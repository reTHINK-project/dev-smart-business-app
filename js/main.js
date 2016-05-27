(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var domain = 'localhost';
var userStatusHyperty = null;
var chatHyperty = null;
var connectorHyperty = null;

var userDirectory = [['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'], ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'], ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']];

var defaultAvatar = 'img/photo.jpg';

var userStatusHypertyURI = function userStatusHypertyURI(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/UserStatusHyperty';
};
var chatHypertyURI = function chatHypertyURI(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/GroupChat';
};
var connectorHypertyURI = function connectorHypertyURI(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/HypertyConnector';
};

console.log('############################### loading runtime');
rethink.default.install({
  domain: domain,
  development: true
}).then(function (runtime) {
  console.log('############################### loading user status hyperty', runtime);
  runtime.requireHyperty(userStatusHypertyURI(domain)).then(function (hyperty) {
    userStatusHyperty = hyperty;
    console.log('###############################', userStatusHyperty);
    return runtime.requireHyperty(chatHypertyURI(domain)).then(function (hyperty) {
      chatHyperty = hyperty;
      console.log('###############################', chatHyperty);
      return runtime.requireHyperty(connectorHypertyURI(domain)).then(function (hyperty) {
        connectorHyperty = hyperty;
        console.log('###############################', connectorHyperty);
        init();
      });
    });
  });
});

function init() {
  console.log('############################### start smart business app');
  $('#app').removeClass('hide');
  $('#loading').addClass('hide');

  // bind statusChange event for presence update
  userStatusHyperty.instance.addEventListener('statusChange', function (event) {
    console.log('############################### handle statusChange event for', event);
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status);
    var items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'disconnected') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });

  // bind chat creation
  chatHyperty.instance.onInvite(function (chatGroup) {
    console.log('############################### detect invite for chat', chatGroup);
    chatGroup.onMessage(function (message) {
      console.log('############################### new message received: ', message);
      var email = message._dataObjectChild.identity.email;
      showUserDetail(email).then(function () {
        return prepareChat(chatGroup, email);
      }).then(function () {
        processMessage(email, message);
      });
    });
  });

  // start chat
  $('#main').on('click', '.startChat', function () {
    var email = $(this).closest('.user-detail').attr('rel');
    $(this).closest('.row').remove();
    console.log('############################### start chat with', email);
    chatHyperty.instance.create(email, [{ email: email, domain: 'localhost' }]).then(function (chatGroup) {
      prepareChat(chatGroup, email).then(function (chatGroup) {
        console.log('############################### bind event onMessage');
        chatGroup.onMessage(function (message) {
          console.log('############################### on startbtn event promise', chatGroup);
          processMessage(email, message);
        });
      });
    });
  });

  // user directory click
  $('#user-list').on('click', 'a:not(.state-disconnected)', function (e) {
    e.preventDefault();
    var email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });

  // user status change
  $('#user-status-toggler').find('a').on('click', function (e) {
    e.preventDefault();
    userStatusHyperty.instance.setStatus($(this).attr('rel'));
  });

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then(function (template) {
    var participants = [];
    $.each(userDirectory, function (i, v) {
      $('#user-list').append(template({ email: v[0], username: v[1] }));
      participants.push({ email: v[0], domain: v[2] });
    });

    userStatusHyperty.instance.create(participants).then(function (res) {
      console.log('############################### invite for user presence ok', res);
    }).catch(function (reason) {
      console.error(reason);
    });
  });
}

function processMessage(email, message) {
  console.info('############################### new message received: ', message);
  var msg = typeof message.text !== 'undefined' ? message.text.replace(/\n/g, '<br>') : message;
  var chatSection = $('#' + email.split('@')[0]).find('.chat-section');
  var messagesList = chatSection.find('.messages .collection'); //getUserNicknameByEmail(remoteUser)
  var list = '<li class="collection-item avatar ' + (message.isMe ? 'local' : 'remote') + '">\n    <span class="title left">' + getUserNicknameByEmail(email) + '</span>\n    <img src="' + defaultAvatar + '" alt="" class="circle">\n    <p class="left">' + msg + '</p>\n    </li>';
  messagesList.append(list);
  messagesList.scrollTop(messagesList[0].scrollHeight);
}

/**
 * Return nickname corresponding to email
 */
function getUserNicknameByEmail(email) {
  var res = '';
  $.each(userDirectory, function (i, v) {
    if (v[0] === email) {
      res = v[1];
      return false;
    }
  });
  return res;
}

/**
 * Fetch user infos by email & display user detail on main content
 */
function showUserDetail(email) {
  console.log('############################### showUserDetail', email);
  return new Promise(function (resolve, reject) {
    var userPrefix = email.split('@')[0];
    if ($('#' + userPrefix).length === 0) {
      console.log('############################### add tab for user', email);
      $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
      $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
      return userStatusHyperty.instance._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then(function (data) {
        console.log('############################### show user detail for', data);
        Handlebars.getTemplate('tpl/user-details').then(function (template) {
          $('#' + userPrefix).append(template({
            email: email,
            username: getUserNicknameByEmail(email),
            avatar: defaultAvatar
          }));
          $('#tab-manager').tabs('select_tab', userPrefix);
          resolve();
        });
      }).catch(function (reason) {
        reject(reason);
      });
    } else {
      console.log('############################### tab for user', email, 'already exist');
      resolve();
    }
  });
}

function prepareChat(chatGroup, email) {

  console.log('############################### prepareChat', chatGroup, email);
  return new Promise(function (resolve, reject) {
    var userPrefix = email.split('@')[0];
    if ($('#' + userPrefix).find('.message-form').length > 0) {
      console.log('############################### container chat already exist for', email);
      resolve(chatGroup);
    } else {
      console.log('############################### add container chat for', email);
      Handlebars.getTemplate('tpl/chat-section').then(function (html) {
        var containerEl = $('#' + userPrefix).find('.chat-section');
        containerEl.removeClass('hide').append(html);

        var messageForm = containerEl.find('.message-form');
        var textArea = messageForm.find('.materialize-textarea');

        textArea.on('keyup', function (e) {
          if (e.keyCode === 13 && !e.shiftKey) {
            messageForm.submit();
          }
        });

        messageForm.on('submit', function (e) {
          e.preventDefault();

          var message = messageForm.find('[name="message"]').val();
          chatGroup.sendMessage(message).then(function (result) {
            console.log('############################### message sent', result);
            messageForm.get(0).reset();
            processMessage(email, result);
          }).catch(function (reason) {
            console.error('message error', reason);
          });
        });
        resolve(chatGroup);
      }).catch(function () {
        reject();
      });
    }
  });
}

Handlebars.getTemplate = function (name) {
  return new Promise(function (resolve, reject) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: name + '.hbs',
      success: function success(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },

      fail: function fail(reason) {
        reject(reason);
      }
    });
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLG9CQUFvQixJQUF4QjtBQUNBLElBQUksY0FBYyxJQUFsQjtBQUNBLElBQUksbUJBQW1CLElBQXZCOztBQUVBLElBQUksZ0JBQWdCLENBQ2hCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRGdCLEVBRWhCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRmdCLEVBR2hCLENBQUMsMEJBQUQsRUFBNkIsYUFBN0IsRUFBNEMsV0FBNUMsQ0FIZ0IsQ0FBcEI7O0FBTUEsSUFBSSxnQkFBZ0IsZUFBcEI7O0FBRUEsSUFBTSx1QkFBdUIsU0FBdkIsb0JBQXVCLENBQUMsTUFBRDtBQUFBLGtDQUFtQyxNQUFuQztBQUFBLENBQTdCO0FBQ0EsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsQ0FBQyxNQUFEO0FBQUEsa0NBQW1DLE1BQW5DO0FBQUEsQ0FBdkI7QUFDQSxJQUFNLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxNQUFEO0FBQUEsa0NBQW1DLE1BQW5DO0FBQUEsQ0FBNUI7O0FBRUEsUUFBUSxHQUFSLENBQVksaURBQVo7QUFDQSxRQUFRLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBd0I7QUFDdEIsVUFBUSxNQURjO0FBRXRCLGVBQWE7QUFGUyxDQUF4QixFQUdHLElBSEgsQ0FHUSxVQUFDLE9BQUQsRUFBYTtBQUNuQixVQUFRLEdBQVIsQ0FBWSw2REFBWixFQUEyRSxPQUEzRTtBQUNBLFVBQVEsY0FBUixDQUF1QixxQkFBcUIsTUFBckIsQ0FBdkIsRUFBcUQsSUFBckQsQ0FBMEQsVUFBQyxPQUFELEVBQWE7QUFDckUsd0JBQW9CLE9BQXBCO0FBQ0EsWUFBUSxHQUFSLENBQVksaUNBQVosRUFBK0MsaUJBQS9DO0FBQ0EsV0FB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QUFXLE9BQVgsQ0FBbUIsSUFBbkIsQ0FBN0I7QUFDQSxnQkFBUSxXQUFXLFNBQVgsQ0FBcUIsSUFBckIsQ0FBUjtBQUNELE9BTEk7O0FBT0wsWUFBTSxjQUFTLE1BQVQsRUFBaUI7QUFDckIsZUFBTyxNQUFQO0FBQ0Q7QUFUSSxLQUFQO0FBV0QsR0FsQk0sQ0FBUDtBQW1CRCxDQXBCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZG9tYWluID0gJ2xvY2FsaG9zdCc7XG5sZXQgdXNlclN0YXR1c0h5cGVydHkgPSBudWxsO1xubGV0IGNoYXRIeXBlcnR5ID0gbnVsbDtcbmxldCBjb25uZWN0b3JIeXBlcnR5ID0gbnVsbDtcblxubGV0IHVzZXJEaXJlY3RvcnkgPSBbXG4gICAgWydvcGVuaWR0ZXN0MTBAZ21haWwuY29tJywgJ1Rlc3QgT3BlbiBJRCAxMCcsICdsb2NhbGhvc3QnXSxcbiAgICBbJ29wZW5pZHRlc3QyMEBnbWFpbC5jb20nLCAnVGVzdCBPcGVuIElEIDIwJywgJ2xvY2FsaG9zdCddLFxuICAgIFsnb3BlbmlkMS5hcGl6ZWVAZ21haWwuY29tJywgJ1Rlc3QgQXBpemVlJywgJ2xvY2FsaG9zdCddXG5dO1xuXG5sZXQgZGVmYXVsdEF2YXRhciA9ICdpbWcvcGhvdG8uanBnJztcblxuY29uc3QgdXNlclN0YXR1c0h5cGVydHlVUkkgPSAoZG9tYWluKSA9PiBgaHlwZXJ0eS1jYXRhbG9ndWU6Ly8ke2RvbWFpbn0vLndlbGwta25vd24vaHlwZXJ0eS9Vc2VyU3RhdHVzSHlwZXJ0eWA7XG5jb25zdCBjaGF0SHlwZXJ0eVVSSSA9IChkb21haW4pID0+IGBoeXBlcnR5LWNhdGFsb2d1ZTovLyR7ZG9tYWlufS8ud2VsbC1rbm93bi9oeXBlcnR5L0dyb3VwQ2hhdGA7XG5jb25zdCBjb25uZWN0b3JIeXBlcnR5VVJJID0gKGRvbWFpbikgPT4gYGh5cGVydHktY2F0YWxvZ3VlOi8vJHtkb21haW59Ly53ZWxsLWtub3duL2h5cGVydHkvSHlwZXJ0eUNvbm5lY3RvcmA7XG5cbmNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGxvYWRpbmcgcnVudGltZScpO1xucmV0aGluay5kZWZhdWx0Lmluc3RhbGwoe1xuICBkb21haW46IGRvbWFpbixcbiAgZGV2ZWxvcG1lbnQ6IHRydWVcbn0pLnRoZW4oKHJ1bnRpbWUpID0+IHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyB1c2VyIHN0YXR1cyBoeXBlcnR5JywgcnVudGltZSk7XG4gIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkodXNlclN0YXR1c0h5cGVydHlVUkkoZG9tYWluKSkudGhlbigoaHlwZXJ0eSkgPT4ge1xuICAgIHVzZXJTdGF0dXNIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHVzZXJTdGF0dXNIeXBlcnR5KTtcbiAgICByZXR1cm4gcnVudGltZS5yZXF1aXJlSHlwZXJ0eShjaGF0SHlwZXJ0eVVSSShkb21haW4pKS50aGVuKChoeXBlcnR5KSA9PiB7XG4gICAgICBjaGF0SHlwZXJ0eSA9IGh5cGVydHk7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIGNoYXRIeXBlcnR5KTtcbiAgICAgIHJldHVybiBydW50aW1lLnJlcXVpcmVIeXBlcnR5KGNvbm5lY3Rvckh5cGVydHlVUkkoZG9tYWluKSkudGhlbigoaHlwZXJ0eSkgPT4ge1xuICAgICAgICBjb25uZWN0b3JIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCBjb25uZWN0b3JIeXBlcnR5KTtcbiAgICAgICAgaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IHNtYXJ0IGJ1c2luZXNzIGFwcCcpO1xuICAkKCcjYXBwJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgJCgnI2xvYWRpbmcnKS5hZGRDbGFzcygnaGlkZScpO1xuXG4gIC8vIGJpbmQgc3RhdHVzQ2hhbmdlIGV2ZW50IGZvciBwcmVzZW5jZSB1cGRhdGVcbiAgdXNlclN0YXR1c0h5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignc3RhdHVzQ2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgaGFuZGxlIHN0YXR1c0NoYW5nZSBldmVudCBmb3InLCBldmVudCk7XG4gICAgbGV0IGVtYWlsID0gKHR5cGVvZiBldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV2ZW50LmlkZW50aXR5ICE9PSAndW5kZWZpbmVkJykgPyBldmVudC5pZGVudGl0eS5lbWFpbCA6ICdub25lJztcbiAgICAkKCcjdXNlci1saXN0JykuY2hpbGRyZW4oJ1tyZWw9XCInICsgZW1haWwgKyAnXCJdJykucmVtb3ZlQ2xhc3MoJ3N0YXRlLWRpc2Nvbm5lY3RlZCBzdGF0ZS1jb25uZWN0ZWQgc3RhdGUtYnVzeScpLmFkZENsYXNzKCdzdGF0ZS0nICsgZXZlbnQuc3RhdHVzKTtcbiAgICBsZXQgaXRlbXMgPSAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmFkZCgkKCcjdGFiLW1hbmFnZXInKS5maW5kKCdbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpKTtcbiAgICBpZiAoZXZlbnQuc3RhdHVzID09PSAnZGlzY29ubmVjdGVkJykge1xuICAgICAgaXRlbXMuYWRkQ2xhc3MoJ2Rpc2FibGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlbXMucmVtb3ZlQ2xhc3MoJ2Rpc2FibGUnKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGJpbmQgY2hhdCBjcmVhdGlvblxuICBjaGF0SHlwZXJ0eS5pbnN0YW5jZS5vbkludml0ZShmdW5jdGlvbihjaGF0R3JvdXApIHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBkZXRlY3QgaW52aXRlIGZvciBjaGF0JywgY2hhdEdyb3VwKTtcbiAgICBjaGF0R3JvdXAub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5ldyBtZXNzYWdlIHJlY2VpdmVkOiAnLCBtZXNzYWdlKTtcbiAgICAgIGxldCBlbWFpbCA9IG1lc3NhZ2UuX2RhdGFPYmplY3RDaGlsZC5pZGVudGl0eS5lbWFpbDtcbiAgICAgIHNob3dVc2VyRGV0YWlsKGVtYWlsKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpO1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBzdGFydCBjaGF0XG4gICQoJyNtYWluJykub24oJ2NsaWNrJywgJy5zdGFydENoYXQnLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgZW1haWwgPSAkKHRoaXMpLmNsb3Nlc3QoJy51c2VyLWRldGFpbCcpLmF0dHIoJ3JlbCcpO1xuICAgICQodGhpcykuY2xvc2VzdCgnLnJvdycpLnJlbW92ZSgpO1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IGNoYXQgd2l0aCcsIGVtYWlsKTtcbiAgICBjaGF0SHlwZXJ0eS5pbnN0YW5jZS5jcmVhdGUoZW1haWwsIFt7ZW1haWw6IGVtYWlsLCBkb21haW46ICdsb2NhbGhvc3QnfV0pLnRoZW4oKGNoYXRHcm91cCkgPT4ge1xuICAgICAgcHJlcGFyZUNoYXQoY2hhdEdyb3VwLCBlbWFpbCkudGhlbigoY2hhdEdyb3VwKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYmluZCBldmVudCBvbk1lc3NhZ2UnKTtcbiAgICAgICAgICBjaGF0R3JvdXAub25NZXNzYWdlKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG9uIHN0YXJ0YnRuIGV2ZW50IHByb21pc2UnLCBjaGF0R3JvdXApO1xuICAgICAgICAgICAgICBwcm9jZXNzTWVzc2FnZShlbWFpbCwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHVzZXIgZGlyZWN0b3J5IGNsaWNrXG4gICQoJyN1c2VyLWxpc3QnKS5vbignY2xpY2snLCAnYTpub3QoLnN0YXRlLWRpc2Nvbm5lY3RlZCknLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBlbWFpbCA9ICQodGhpcykuYXR0cigncmVsJyk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2VhY2ggdXNlciBpbmZvIGZvcicsIGVtYWlsKTtcbiAgICBzaG93VXNlckRldGFpbChlbWFpbCk7XG4gIH0pO1xuXG4gIC8vIHVzZXIgc3RhdHVzIGNoYW5nZVxuICAkKCcjdXNlci1zdGF0dXMtdG9nZ2xlcicpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLnNldFN0YXR1cygkKHRoaXMpLmF0dHIoJ3JlbCcpKTtcbiAgfSk7XG5cbiAgLy8gZmV0Y2ggdXNlci1jYXJkIHRlbXBsYXRlXG4gIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC91c2VyLWNhcmQnKS50aGVuKCh0ZW1wbGF0ZSkgPT4ge1xuICAgIGxldCBwYXJ0aWNpcGFudHMgPSBbXTtcbiAgICAkLmVhY2godXNlckRpcmVjdG9yeSwgZnVuY3Rpb24oaSwgdikge1xuICAgICAgJCgnI3VzZXItbGlzdCcpLmFwcGVuZCh0ZW1wbGF0ZSh7ZW1haWw6IHZbMF0sIHVzZXJuYW1lOiB2WzFdfSkpO1xuICAgICAgcGFydGljaXBhbnRzLnB1c2goe2VtYWlsOiB2WzBdLCBkb21haW46IHZbMl19KTtcbiAgICB9KTtcblxuICAgIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLmNyZWF0ZShwYXJ0aWNpcGFudHMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBpbnZpdGUgZm9yIHVzZXIgcHJlc2VuY2Ugb2snLCByZXMpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc01lc3NhZ2UoZW1haWwsIG1lc3NhZ2UpIHtcbiAgY29uc29sZS5pbmZvKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5ldyBtZXNzYWdlIHJlY2VpdmVkOiAnLCBtZXNzYWdlKTtcbiAgbGV0IG1zZyA9ICh0eXBlb2YgbWVzc2FnZS50ZXh0ICE9PSAndW5kZWZpbmVkJykgPyBtZXNzYWdlLnRleHQucmVwbGFjZSgvXFxuL2csICc8YnI+JykgOiBtZXNzYWdlO1xuICBsZXQgY2hhdFNlY3Rpb24gPSAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmZpbmQoJy5jaGF0LXNlY3Rpb24nKTtcbiAgbGV0IG1lc3NhZ2VzTGlzdCA9IGNoYXRTZWN0aW9uLmZpbmQoJy5tZXNzYWdlcyAuY29sbGVjdGlvbicpOyAvL2dldFVzZXJOaWNrbmFtZUJ5RW1haWwocmVtb3RlVXNlcilcbiAgbGV0IGxpc3QgPSBgPGxpIGNsYXNzPVwiY29sbGVjdGlvbi1pdGVtIGF2YXRhciBgICsgKG1lc3NhZ2UuaXNNZSA/ICdsb2NhbCcgOiAncmVtb3RlJykgKyBgXCI+XG4gICAgPHNwYW4gY2xhc3M9XCJ0aXRsZSBsZWZ0XCI+YCArIGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpICsgYDwvc3Bhbj5cbiAgICA8aW1nIHNyYz1cImAgKyBkZWZhdWx0QXZhdGFyICsgYFwiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlXCI+XG4gICAgPHAgY2xhc3M9XCJsZWZ0XCI+YCArIG1zZyArIGA8L3A+XG4gICAgPC9saT5gO1xuICBtZXNzYWdlc0xpc3QuYXBwZW5kKGxpc3QpO1xuICBtZXNzYWdlc0xpc3Quc2Nyb2xsVG9wKG1lc3NhZ2VzTGlzdFswXS5zY3JvbGxIZWlnaHQpO1xufVxuXG4vKipcbiAqIFJldHVybiBuaWNrbmFtZSBjb3JyZXNwb25kaW5nIHRvIGVtYWlsXG4gKi9cbmZ1bmN0aW9uIGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpIHtcbiAgbGV0IHJlcyA9ICcnO1xuICAkLmVhY2godXNlckRpcmVjdG9yeSwgKGksIHYpID0+IHtcbiAgICBpZiAodlswXSA9PT0gZW1haWwpIHtcbiAgICAgIHJlcyA9IHZbMV07XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBGZXRjaCB1c2VyIGluZm9zIGJ5IGVtYWlsICYgZGlzcGxheSB1c2VyIGRldGFpbCBvbiBtYWluIGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gc2hvd1VzZXJEZXRhaWwoZW1haWwpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2hvd1VzZXJEZXRhaWwnLCBlbWFpbCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHVzZXJQcmVmaXggPSBlbWFpbC5zcGxpdCgnQCcpWzBdO1xuICAgIGlmICgkKCcjJyArIHVzZXJQcmVmaXgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYWRkIHRhYiBmb3IgdXNlcicsIGVtYWlsKTtcbiAgICAgICQoJyN0YWItbWFuYWdlcicpLmFwcGVuZCgnPGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiIHJlbD1cIicgKyBlbWFpbCArICdcIj48YSBocmVmPVwiIycgKyB1c2VyUHJlZml4ICsgJ1wiPicgKyB1c2VyUHJlZml4ICsgJzwvYT48L2xpPicpO1xuICAgICAgJCgnI21haW4nKS5hcHBlbmQoJzxkaXYgaWQ9XCInICsgdXNlclByZWZpeCArICdcIiBjbGFzcz1cImNvbCBzMTJcIj48L2Rpdj4nKTtcbiAgICAgIHJldHVybiB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5faHlwZXJ0eURpc2NvdmVyeS5kaXNjb3Zlckh5cGVydHlQZXJVc2VyKGVtYWlsLCAnbG9jYWxob3N0JykudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzaG93IHVzZXIgZGV0YWlsIGZvcicsIGRhdGEpO1xuICAgICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdXNlci1kZXRhaWxzJykudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAkKCcjJyArIHVzZXJQcmVmaXgpLmFwcGVuZCh0ZW1wbGF0ZSh7XG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICB1c2VybmFtZTogZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCksXG4gICAgICAgICAgICBhdmF0YXI6IGRlZmF1bHRBdmF0YXJcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgJCgnI3RhYi1tYW5hZ2VyJykudGFicygnc2VsZWN0X3RhYicsIHVzZXJQcmVmaXgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaCgocmVhc29uKSA9PiB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHRhYiBmb3IgdXNlcicsIGVtYWlsLCAnYWxyZWFkeSBleGlzdCcpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpIHtcblxuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBwcmVwYXJlQ2hhdCcsIGNoYXRHcm91cCwgZW1haWwpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCB1c2VyUHJlZml4ID0gZW1haWwuc3BsaXQoJ0AnKVswXTtcbiAgICBpZiAoJCgnIycgKyB1c2VyUHJlZml4KS5maW5kKCcubWVzc2FnZS1mb3JtJykubGVuZ3RoID4gMCkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgY29udGFpbmVyIGNoYXQgYWxyZWFkeSBleGlzdCBmb3InLCBlbWFpbCk7XG4gICAgICByZXNvbHZlKGNoYXRHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGFkZCBjb250YWluZXIgY2hhdCBmb3InLCBlbWFpbCk7XG4gICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvY2hhdC1zZWN0aW9uJykudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICBsZXQgY29udGFpbmVyRWwgPSAkKCcjJyArIHVzZXJQcmVmaXgpLmZpbmQoJy5jaGF0LXNlY3Rpb24nKTtcbiAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2hpZGUnKS5hcHBlbmQoaHRtbCk7XG5cbiAgICAgICAgbGV0IG1lc3NhZ2VGb3JtID0gY29udGFpbmVyRWwuZmluZCgnLm1lc3NhZ2UtZm9ybScpO1xuICAgICAgICBsZXQgdGV4dEFyZWEgPSBtZXNzYWdlRm9ybS5maW5kKCcubWF0ZXJpYWxpemUtdGV4dGFyZWEnKTtcblxuICAgICAgICB0ZXh0QXJlYS5vbigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzICYmICFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBtZXNzYWdlRm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1lc3NhZ2VGb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIGxldCBtZXNzYWdlID0gbWVzc2FnZUZvcm0uZmluZCgnW25hbWU9XCJtZXNzYWdlXCJdJykudmFsKCk7XG4gICAgICAgICAgY2hhdEdyb3VwLnNlbmRNZXNzYWdlKG1lc3NhZ2UpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBtZXNzYWdlIHNlbnQnLCByZXN1bHQpO1xuICAgICAgICAgICAgbWVzc2FnZUZvcm0uZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICBwcm9jZXNzTWVzc2FnZShlbWFpbCwgcmVzdWx0KTtcbiAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ21lc3NhZ2UgZXJyb3InLCByZWFzb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVzb2x2ZShjaGF0R3JvdXApO1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbkhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoSGFuZGxlYmFycy50ZW1wbGF0ZXMgPT09IHVuZGVmaW5lZCB8fCBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBIYW5kbGViYXJzLnRlbXBsYXRlcyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdKTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBuYW1lICsgJy5oYnMnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKTtcbiAgICAgICAgcmVzb2x2ZShIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSk7XG4gICAgICB9LFxuXG4gICAgICBmYWlsOiBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcbiJdfQ==
