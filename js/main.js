(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var domain = 'localhost';
var userStatusHyperty = null;
var chatHyperty = null;
var connectorHyperty = null;

var userDirectory = [['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'], ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'], ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']];

var defaultAvatar = 'img/photo.jpg';

var hypertyURI = function hypertyURI(domain, hyperty) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/' + hyperty;
};

/****************************************** login form ******************************************/
function logout() {
  localStorage.removeItem('username');
  location.reload(true);
}

function startApp() {
  $('#app').removeClass('hide');
  $('#loading').addClass('hide');
  $('#currentUser').text(localStorage.getItem('username'));
  startRethink();
}
$(function () {
  if (typeof localStorage.username !== 'undefined') {
    console.log('############################### already logged with...', localStorage.username);
    startApp();
  }
  $('#account-example > li').on('click', function () {
    $('#email').val($(this).children('.account-mail').text()).focus();
    $('#pass').val($(this).children('.account-pwd').text()).focus();
  });
  $('#login').on('submit', function (e) {
    e.preventDefault();
    console.log('############################### authenticate through service with...', $('#email').val());
    if ($('#email,#pass')[0].checkValidity()) {
      localStorage.setItem('username', $('#email').val());
      startApp();
    } else {
      console.log('############################### form is not valid...');
    }
  });

  $('#logout').on('click', function (e) {
    e.preventDefault();
    logout();
  });
});

/****************************************** App ******************************************/
function startRethink() {
  console.log('############################### loading runtime');
  rethink.default.install({
    domain: domain,
    development: true
  }).then(function (runtime) {
    console.log('############################### runtime', runtime);
    console.log('############################### loading hyperty', hypertyURI(domain, 'UserStatus'));
    runtime.requireHyperty(hypertyURI(domain, 'UserStatus')).then(function (hyperty) {
      userStatusHyperty = hyperty;
      console.log('###############################', userStatusHyperty);
      console.log('############################### loading hyperty', hypertyURI(domain, 'GroupChat'));
      return runtime.requireHyperty(hypertyURI(domain, 'GroupChat')).then(function (hyperty) {
        chatHyperty = hyperty;
        console.log('###############################', chatHyperty);
        console.log('############################### loading hyperty', hypertyURI(domain, 'HypertyConnector'));
        return runtime.requireHyperty(hypertyURI(domain, 'HypertyConnector')).then(function (hyperty) {
          connectorHyperty = hyperty;
          console.log('###############################', connectorHyperty);
          init();
        });
      });
    });
  });
}

function init() {
  console.log('############################### start smart business app');

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
      }).catch(function (reason) {
        console.error('###############################', reason);
      });
    });
  });

  if (connectorHyperty !== null) {
    connectorHyperty.instance.addEventListener('connector:connected', function (controller) {
      console.log('############################### connector:connected', controller);
      connectorHyperty.instance.addEventListener('have:notification', function (event) {
        console.log('############################### have:notification', event);
        notificationHandler(controller, event);
      });
    });
  }

  // start chat
  $('#main').on('click', '.startChat', function () {
    var email = $(this).closest('.user-detail').attr('rel');
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

  // start call
  $('#main').on('click', '.startCall', function () {
    var email = $(this).closest('.user-detail').attr('rel');
    $(this).remove();
    console.log('############################### start call with', email);
    userStatusHyperty.instance._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then(function (result) {
      var userPrefix = email.split('@')[0];
      Handlebars.getTemplate('tpl/video-section').then(function (html) {
        console.log('############################### openVideo', result);
        $('#' + userPrefix).find('.video-section').append(html);
        openVideo(result.hypertyURL);
      });
    });
  });

  // user directory click
  $('#user-list').on('click', 'a:not(.state-unavailable,.state-away)', function (e) {
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

  updateRelativeTime();
  setInterval(function () {
    updateRelativeTime();
  }, 60000);

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then(function (template) {
    var participants = [];
    $.each(userDirectory, function (i, v) {
      if (v[0] !== localStorage.username) {
        $('#user-list').append(template({ email: v[0], username: v[1] }));
        participants.push({ email: v[0], domain: v[2] });
      }
    });
    console.log('############################### invite for user presence ok', participants);
    userStatusHyperty.instance.create(participants).then(function (res) {
      console.log('############################### invite for user presence ok', res);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });
  });

  // bind statusChange event for presence update
  userStatusHyperty.instance.addEventListener('statusChange', function (event) {
    console.log('############################### handle statusChange event for', event);
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
    var items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'unavailable' || event.status === 'away') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });
}

function updateRelativeTime() {
  $('.time-relative').each(function () {
    var msg = $(this);
    var timeObj = moment.unix(msg.attr('ts'));
    if (timeObj.isSame(moment(), 'day')) {
      msg.text(timeObj.fromNow());
    } else {
      msg.text(timeObj.format('LLL'));
    }
  });
}

/****************************************** chat ******************************************/
function processMessage(email, message) {
  console.info('############################### new message received: ', message);
  var msg = typeof message.text !== 'undefined' ? message.text.replace(/\n/g, '<br>') : message;
  var chatSection = $('#' + email.split('@')[0]).find('.chat-section');
  var messagesList = chatSection.find('.messages .collection'); //getUserNicknameByEmail(remoteUser)
  var ts = Math.round(new Date().getTime() / 1000, 10);
  $('#' + email.split('@')[0]).find('.startChat').remove();
  var list = '<li class="collection-item avatar ' + (message.isMe ? 'local' : 'remote') + '">\n    <span class="time-relative right" ts="' + ts + '">' + moment.unix(ts).fromNow() + '</span>\n    <span class="title left">' + getUserNicknameByEmail(email) + '</span>\n    <img src="' + defaultAvatar + '" alt="" class="circle">\n    <p class="left">' + msg + '</p>\n    </li>';
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
            console.error('###############################', reason);
          });
        });
        resolve(chatGroup);
      }).catch(function () {
        reject();
      });
    }
  });
}

/****************************************** Call ******************************************/
function openVideo(hypertyURL) {

  var options = options || { video: true, audio: true };
  getUserMedia(options).then(function (mediaStream) {
    console.log('############################### received media stream: ', mediaStream);
    return connectorHyperty.instance.connect(hypertyURL, mediaStream);
  }).then(function (controller) {
    console.log('############################### showVideo: ', controller);
    showVideo(controller);

    controller.addEventListener('on:notification', notification);
    controller.addEventListener('on:subscribe', function (controller) {
      console.info('on:subscribe:event ', controller);
    });

    controller.addEventListener('connector:notification', notification);

    controller.addEventListener('stream:added', processVideo);
  }).catch(function (reason) {
    console.error('###############################', reason);
  });
}

function processVideo(event) {
  console.log('############################### processVideo: ', event);

  var messageChat = $('.video-holder');
  var video = messageChat.find('.video');
  video[0].src = URL.createObjectURL(event.stream);
}

function notification(event) {
  console.log('############################### notification: ', event);
}

function notificationHandler(controller, event) {
  console.log('############################### notificationHandler: ', controller, event);
  var calleeInfo = event.identity;
  var incoming = $('.modal-call');
  var acceptBtn = incoming.find('.btn-accept');
  var rejectBtn = incoming.find('.btn-reject');
  var informationHolder = incoming.find('.information');

  console.log('############################### showVideo: ', controller);
  showVideo(controller);

  controller.addEventListener('stream:added', processVideo);

  acceptBtn.on('click', function (e) {

    e.preventDefault();

    var options = options || { video: true, audio: true };
    getUserMedia(options).then(function (mediaStream) {
      console.info('recived media stream: ', mediaStream);
      return controller.accept(mediaStream);
    }).then(function (result) {
      console.log(result);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });
  });

  rejectBtn.on('click', function (e) {

    controller.decline().then(function (result) {
      console.log(result);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });

    e.preventDefault();
  });

  var parseInformation = '<div class="col s12">' + '<div class="row valign-wrapper">' + '<div class="col s2">' + '<img src="' + calleeInfo.infoToken.picture + '" alt="" class="circle responsive-img">' + '</div>' + '<span class="col s10">' + '<div class="row">' + '<span class="col s3 text-right">Name: </span>' + '<span class="col s9 black-text">' + calleeInfo.infoToken.name + '</span>' + '</span>' + '<span class="row">' + '<span class="col s3 text-right">Email: </span>' + '<span class="col s9 black-text">' + calleeInfo.infoToken.email + '</span>' + '</span>' + '<span class="row">' + '<span class="col s3 text-right">locale: </span>' + '<span class="col s9 black-text">' + calleeInfo.infoToken.locale + '</span>' + '</span>' + '</div>' + '</div>';

  informationHolder.html(parseInformation);
  $('.modal-call').openModal();
}

// function processLocalVideo(controller) {
//
//   var localStreams = controller.getLocalStreams;
//   for (var stream of localStreams) {
//     console.log('Local stream: ' + stream.id);
//   }
//
// }

function showVideo(controller) {
  var videoHolder = $('.video-holder');
  videoHolder.removeClass('hide');

  var btnCamera = videoHolder.find('.camera');
  var btnMute = videoHolder.find('.mute');
  var btnMic = videoHolder.find('.mic');
  var btnHangout = videoHolder.find('.hangout');

  console.log(controller);

  btnCamera.on('click', function (event) {

    event.preventDefault();

    controller.disableCam().then(function (status) {
      console.log(status, 'camera');
      var icon = 'videocam_off';
      var text = 'Disable Camera';
      if (!status) {
        text = 'Enable Camera';
        icon = 'videocam';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });
  });

  btnMute.on('click', function (event) {

    event.preventDefault();

    controller.mute().then(function (status) {
      console.log(status, 'audio');
      var icon = 'volume_off';
      var text = 'Disable Sound';
      if (!status) {
        text = 'Enable Sound';
        icon = 'volume_up';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function (e) {
      console.error(e);
    });

    console.log('mute other peer');
  });

  btnMic.on('click', function (event) {

    event.preventDefault();

    controller.disableMic().then(function (status) {
      console.log(status, 'mic');
      var icon = 'mic_off';
      var text = 'Disable Microphone';
      if (!status) {
        icon = 'mic';
        text = 'Enable Microphone';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function (e) {
      console.error(e);
    });
  });

  btnHangout.on('click', function (event) {

    event.preventDefault();

    console.log('hangout');
  });
}

function getUserMedia(constraints) {

  return new Promise(function (resolve, reject) {

    navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
      resolve(mediaStream);
    }).catch(function (reason) {
      reject(reason);
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLG9CQUFvQixJQUF4QjtBQUNBLElBQUksY0FBYyxJQUFsQjtBQUNBLElBQUksbUJBQW1CLElBQXZCOztBQUVBLElBQUksZ0JBQWdCLENBQ2hCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRGdCLEVBRWhCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRmdCLEVBR2hCLENBQUMsMEJBQUQsRUFBNkIsYUFBN0IsRUFBNEMsV0FBNUMsQ0FIZ0IsQ0FBcEI7O0FBTUEsSUFBSSxnQkFBZ0IsZUFBcEI7O0FBRUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLE1BQUQsRUFBUyxPQUFUO0FBQUEsa0NBQTRDLE1BQTVDLDZCQUEwRSxPQUExRTtBQUFBLENBQW5COzs7QUFHQSxTQUFTLE1BQVQsR0FBa0I7QUFDaEIsZUFBYSxVQUFiLENBQXdCLFVBQXhCO0FBQ0EsV0FBUyxNQUFULENBQWdCLElBQWhCO0FBQ0Q7O0FBRUQsU0FBUyxRQUFULEdBQW9CO0FBQ2xCLElBQUUsTUFBRixFQUFVLFdBQVYsQ0FBc0IsTUFBdEI7QUFDQSxJQUFFLFVBQUYsRUFBYyxRQUFkLENBQXVCLE1BQXZCO0FBQ0EsSUFBRSxjQUFGLEVBQWtCLElBQWxCLENBQXVCLGFBQWEsT0FBYixDQUFxQixVQUFyQixDQUF2QjtBQUNBO0FBQ0Q7QUFDRCxFQUFFLFlBQVc7QUFDWCxNQUFJLE9BQU8sYUFBYSxRQUFwQixLQUFpQyxXQUFyQyxFQUFrRDtBQUNoRCxZQUFRLEdBQVIsQ0FBWSx3REFBWixFQUFzRSxhQUFhLFFBQW5GO0FBQ0E7QUFDRDtBQUNELElBQUUsdUJBQUYsRUFBMkIsRUFBM0IsQ0FBOEIsT0FBOUIsRUFBdUMsWUFBVztBQUNoRCxNQUFF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ckIsQ0FBUjtBQUNELE9BTEk7O0FBT0wsWUFBTSxjQUFTLE1BQVQsRUFBaUI7QUFDckIsZUFBTyxNQUFQO0FBQ0Q7QUFUSSxLQUFQO0FBV0QsR0FsQk0sQ0FBUDtBQW1CRCxDQXBCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZG9tYWluID0gJ2xvY2FsaG9zdCc7XG5sZXQgdXNlclN0YXR1c0h5cGVydHkgPSBudWxsO1xubGV0IGNoYXRIeXBlcnR5ID0gbnVsbDtcbmxldCBjb25uZWN0b3JIeXBlcnR5ID0gbnVsbDtcblxubGV0IHVzZXJEaXJlY3RvcnkgPSBbXG4gICAgWydvcGVuaWR0ZXN0MTBAZ21haWwuY29tJywgJ1Rlc3QgT3BlbiBJRCAxMCcsICdsb2NhbGhvc3QnXSxcbiAgICBbJ29wZW5pZHRlc3QyMEBnbWFpbC5jb20nLCAnVGVzdCBPcGVuIElEIDIwJywgJ2xvY2FsaG9zdCddLFxuICAgIFsnb3BlbmlkMS5hcGl6ZWVAZ21haWwuY29tJywgJ1Rlc3QgQXBpemVlJywgJ2xvY2FsaG9zdCddXG5dO1xuXG5sZXQgZGVmYXVsdEF2YXRhciA9ICdpbWcvcGhvdG8uanBnJztcblxuY29uc3QgaHlwZXJ0eVVSSSA9IChkb21haW4sIGh5cGVydHkpID0+IGBoeXBlcnR5LWNhdGFsb2d1ZTovLyR7ZG9tYWlufS8ud2VsbC1rbm93bi9oeXBlcnR5LyR7aHlwZXJ0eX1gO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIGxvZ2luIGZvcm0gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gbG9nb3V0KCkge1xuICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcm5hbWUnKTtcbiAgbG9jYXRpb24ucmVsb2FkKHRydWUpO1xufVxuXG5mdW5jdGlvbiBzdGFydEFwcCgpIHtcbiAgJCgnI2FwcCcpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG4gICQoJyNsb2FkaW5nJykuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgJCgnI2N1cnJlbnRVc2VyJykudGV4dChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSk7XG4gIHN0YXJ0UmV0aGluaygpO1xufVxuJChmdW5jdGlvbigpIHtcbiAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UudXNlcm5hbWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYWxyZWFkeSBsb2dnZWQgd2l0aC4uLicsIGxvY2FsU3RvcmFnZS51c2VybmFtZSk7XG4gICAgc3RhcnRBcHAoKTtcbiAgfVxuICAkKCcjYWNjb3VudC1leGFtcGxlID4gbGknKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAkKCcjZW1haWwnKS52YWwoJCh0aGlzKS5jaGlsZHJlbignLmFjY291bnQtbWFpbCcpLnRleHQoKSkuZm9jdXMoKTtcbiAgICAkKCcjcGFzcycpLnZhbCgkKHRoaXMpLmNoaWxkcmVuKCcuYWNjb3VudC1wd2QnKS50ZXh0KCkpLmZvY3VzKCk7XG4gIH0pO1xuICAkKCcjbG9naW4nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBhdXRoZW50aWNhdGUgdGhyb3VnaCBzZXJ2aWNlIHdpdGguLi4nLCAkKCcjZW1haWwnKS52YWwoKSk7XG4gICAgaWYgKCQoJyNlbWFpbCwjcGFzcycpWzBdLmNoZWNrVmFsaWRpdHkoKSkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgJCgnI2VtYWlsJykudmFsKCkpO1xuICAgICAgc3RhcnRBcHAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgZm9ybSBpcyBub3QgdmFsaWQuLi4nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJyNsb2dvdXQnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxvZ291dCgpO1xuICB9KTtcbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEFwcCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBzdGFydFJldGhpbmsoKSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGxvYWRpbmcgcnVudGltZScpO1xuICByZXRoaW5rLmRlZmF1bHQuaW5zdGFsbCh7XG4gICAgZG9tYWluOiBkb21haW4sXG4gICAgZGV2ZWxvcG1lbnQ6IHRydWVcbiAgfSkudGhlbigocnVudGltZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHJ1bnRpbWUnLCBydW50aW1lKTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBsb2FkaW5nIGh5cGVydHknLCBoeXBlcnR5VVJJKGRvbWFpbiwgJ1VzZXJTdGF0dXMnKSk7XG4gICAgcnVudGltZS5yZXF1aXJlSHlwZXJ0eShoeXBlcnR5VVJJKGRvbWFpbiwgJ1VzZXJTdGF0dXMnKSkudGhlbigoaHlwZXJ0eSkgPT4ge1xuICAgICAgdXNlclN0YXR1c0h5cGVydHkgPSBoeXBlcnR5O1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCB1c2VyU3RhdHVzSHlwZXJ0eSk7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBsb2FkaW5nIGh5cGVydHknLCBoeXBlcnR5VVJJKGRvbWFpbiwgJ0dyb3VwQ2hhdCcpKTtcbiAgICAgIHJldHVybiBydW50aW1lLnJlcXVpcmVIeXBlcnR5KGh5cGVydHlVUkkoZG9tYWluLCAnR3JvdXBDaGF0JykpLnRoZW4oKGh5cGVydHkpID0+IHtcbiAgICAgICAgY2hhdEh5cGVydHkgPSBoeXBlcnR5O1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIGNoYXRIeXBlcnR5KTtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyBoeXBlcnR5JywgaHlwZXJ0eVVSSShkb21haW4sICdIeXBlcnR5Q29ubmVjdG9yJykpO1xuICAgICAgICByZXR1cm4gcnVudGltZS5yZXF1aXJlSHlwZXJ0eShoeXBlcnR5VVJJKGRvbWFpbiwgJ0h5cGVydHlDb25uZWN0b3InKSkudGhlbigoaHlwZXJ0eSkgPT4ge1xuICAgICAgICAgIGNvbm5lY3Rvckh5cGVydHkgPSBoeXBlcnR5O1xuICAgICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgY29ubmVjdG9ySHlwZXJ0eSk7XG4gICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc3RhcnQgc21hcnQgYnVzaW5lc3MgYXBwJyk7XG5cbiAgLy8gYmluZCBjaGF0IGNyZWF0aW9uXG4gIGNoYXRIeXBlcnR5Lmluc3RhbmNlLm9uSW52aXRlKGZ1bmN0aW9uKGNoYXRHcm91cCkge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGRldGVjdCBpbnZpdGUgZm9yIGNoYXQnLCBjaGF0R3JvdXApO1xuICAgIGNoYXRHcm91cC5vbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbmV3IG1lc3NhZ2UgcmVjZWl2ZWQ6ICcsIG1lc3NhZ2UpO1xuICAgICAgbGV0IGVtYWlsID0gbWVzc2FnZS5fZGF0YU9iamVjdENoaWxkLmlkZW50aXR5LmVtYWlsO1xuICAgICAgc2hvd1VzZXJEZXRhaWwoZW1haWwpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJlcGFyZUNoYXQoY2hhdEdyb3VwLCBlbWFpbCk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgcHJvY2Vzc01lc3NhZ2UoZW1haWwsIG1lc3NhZ2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGlmIChjb25uZWN0b3JIeXBlcnR5ICE9PSBudWxsKSB7XG4gICAgY29ubmVjdG9ySHlwZXJ0eS5pbnN0YW5jZS5hZGRFdmVudExpc3RlbmVyKCdjb25uZWN0b3I6Y29ubmVjdGVkJywgZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgY29ubmVjdG9yOmNvbm5lY3RlZCcsIGNvbnRyb2xsZXIpO1xuICAgICAgY29ubmVjdG9ySHlwZXJ0eS5pbnN0YW5jZS5hZGRFdmVudExpc3RlbmVyKCdoYXZlOm5vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGhhdmU6bm90aWZpY2F0aW9uJywgZXZlbnQpO1xuICAgICAgICBub3RpZmljYXRpb25IYW5kbGVyKGNvbnRyb2xsZXIsIGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gc3RhcnQgY2hhdFxuICAkKCcjbWFpbicpLm9uKCdjbGljaycsICcuc3RhcnRDaGF0JywgZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVtYWlsID0gJCh0aGlzKS5jbG9zZXN0KCcudXNlci1kZXRhaWwnKS5hdHRyKCdyZWwnKTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzdGFydCBjaGF0IHdpdGgnLCBlbWFpbCk7XG4gICAgY2hhdEh5cGVydHkuaW5zdGFuY2UuY3JlYXRlKGVtYWlsLCBbe2VtYWlsOiBlbWFpbCwgZG9tYWluOiAnbG9jYWxob3N0J31dKS50aGVuKChjaGF0R3JvdXApID0+IHtcbiAgICAgIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpLnRoZW4oKGNoYXRHcm91cCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBiaW5kIGV2ZW50IG9uTWVzc2FnZScpO1xuICAgICAgICBjaGF0R3JvdXAub25NZXNzYWdlKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgb24gc3RhcnRidG4gZXZlbnQgcHJvbWlzZScsIGNoYXRHcm91cCk7XG4gICAgICAgICAgcHJvY2Vzc01lc3NhZ2UoZW1haWwsIG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBzdGFydCBjYWxsXG4gICQoJyNtYWluJykub24oJ2NsaWNrJywgJy5zdGFydENhbGwnLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgZW1haWwgPSAkKHRoaXMpLmNsb3Nlc3QoJy51c2VyLWRldGFpbCcpLmF0dHIoJ3JlbCcpO1xuICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc3RhcnQgY2FsbCB3aXRoJywgZW1haWwpO1xuICAgIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLl9oeXBlcnR5RGlzY292ZXJ5LmRpc2NvdmVySHlwZXJ0eVBlclVzZXIoZW1haWwsICdsb2NhbGhvc3QnKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgIGxldCB1c2VyUHJlZml4ID0gZW1haWwuc3BsaXQoJ0AnKVswXTtcbiAgICAgIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC92aWRlby1zZWN0aW9uJykudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBvcGVuVmlkZW8nLCByZXN1bHQpO1xuICAgICAgICAkKCcjJyArIHVzZXJQcmVmaXgpLmZpbmQoJy52aWRlby1zZWN0aW9uJykuYXBwZW5kKGh0bWwpO1xuICAgICAgICBvcGVuVmlkZW8ocmVzdWx0Lmh5cGVydHlVUkwpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHVzZXIgZGlyZWN0b3J5IGNsaWNrXG4gICQoJyN1c2VyLWxpc3QnKS5vbignY2xpY2snLCAnYTpub3QoLnN0YXRlLXVuYXZhaWxhYmxlLC5zdGF0ZS1hd2F5KScsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGVtYWlsID0gJCh0aGlzKS5hdHRyKCdyZWwnKTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzZWFjaCB1c2VyIGluZm8gZm9yJywgZW1haWwpO1xuICAgIHNob3dVc2VyRGV0YWlsKGVtYWlsKTtcbiAgfSk7XG5cbiAgLy8gdXNlciBzdGF0dXMgY2hhbmdlXG4gICQoJyN1c2VyLXN0YXR1cy10b2dnbGVyJykuZmluZCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXNlclN0YXR1c0h5cGVydHkuaW5zdGFuY2Uuc2V0U3RhdHVzKCQodGhpcykuYXR0cigncmVsJykpO1xuICB9KTtcblxuICB1cGRhdGVSZWxhdGl2ZVRpbWUoKTtcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIHVwZGF0ZVJlbGF0aXZlVGltZSgpO1xuICB9LCA2MDAwMCk7XG5cbiAgLy8gZmV0Y2ggdXNlci1jYXJkIHRlbXBsYXRlXG4gIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC91c2VyLWNhcmQnKS50aGVuKCh0ZW1wbGF0ZSkgPT4ge1xuICAgIGxldCBwYXJ0aWNpcGFudHMgPSBbXTtcbiAgICAkLmVhY2godXNlckRpcmVjdG9yeSwgZnVuY3Rpb24oaSwgdikge1xuICAgICAgaWYgKHZbMF0gIT09IGxvY2FsU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAkKCcjdXNlci1saXN0JykuYXBwZW5kKHRlbXBsYXRlKHtlbWFpbDogdlswXSwgdXNlcm5hbWU6IHZbMV19KSk7XG4gICAgICAgIHBhcnRpY2lwYW50cy5wdXNoKHtlbWFpbDogdlswXSwgZG9tYWluOiB2WzJdfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgaW52aXRlIGZvciB1c2VyIHByZXNlbmNlIG9rJywgcGFydGljaXBhbnRzKTtcbiAgICB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5jcmVhdGUocGFydGljaXBhbnRzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgaW52aXRlIGZvciB1c2VyIHByZXNlbmNlIG9rJywgcmVzKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBiaW5kIHN0YXR1c0NoYW5nZSBldmVudCBmb3IgcHJlc2VuY2UgdXBkYXRlXG4gIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLmFkZEV2ZW50TGlzdGVuZXIoJ3N0YXR1c0NoYW5nZScsIChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGhhbmRsZSBzdGF0dXNDaGFuZ2UgZXZlbnQgZm9yJywgZXZlbnQpO1xuICAgIGxldCBlbWFpbCA9ICh0eXBlb2YgZXZlbnQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBldmVudC5pZGVudGl0eSAhPT0gJ3VuZGVmaW5lZCcpID8gZXZlbnQuaWRlbnRpdHkuZW1haWwgOiAnbm9uZSc7XG4gICAgJCgnI3VzZXItbGlzdCcpLmNoaWxkcmVuKCdbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpLnJlbW92ZUNsYXNzKCdzdGF0ZS1hdmFpbGFibGUgc3RhdGUtdW5hdmFpbGFibGUgc3RhdGUtYnVzeSBzdGF0ZS1hd2F5JykuYWRkQ2xhc3MoJ3N0YXRlLScgKyBldmVudC5zdGF0dXMpO1xuICAgIGxldCBpdGVtcyA9ICQoJyMnICsgZW1haWwuc3BsaXQoJ0AnKVswXSkuYWRkKCQoJyN0YWItbWFuYWdlcicpLmZpbmQoJ1tyZWw9XCInICsgZW1haWwgKyAnXCJdJykpO1xuICAgIGlmIChldmVudC5zdGF0dXMgPT09ICd1bmF2YWlsYWJsZScgfHwgZXZlbnQuc3RhdHVzID09PSAnYXdheScpIHtcbiAgICAgIGl0ZW1zLmFkZENsYXNzKCdkaXNhYmxlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZW1zLnJlbW92ZUNsYXNzKCdkaXNhYmxlJyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVsYXRpdmVUaW1lKCkge1xuICAkKCcudGltZS1yZWxhdGl2ZScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1zZyA9ICQodGhpcyk7XG4gICAgbGV0IHRpbWVPYmogPSBtb21lbnQudW5peChtc2cuYXR0cigndHMnKSk7XG4gICAgaWYgKHRpbWVPYmouaXNTYW1lKG1vbWVudCgpLCAnZGF5JykpIHtcbiAgICAgIG1zZy50ZXh0KHRpbWVPYmouZnJvbU5vdygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbXNnLnRleHQodGltZU9iai5mb3JtYXQoJ0xMTCcpKTtcbiAgICB9XG4gIH0pO1xuXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogY2hhdCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBwcm9jZXNzTWVzc2FnZShlbWFpbCwgbWVzc2FnZSkge1xuICBjb25zb2xlLmluZm8oJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbmV3IG1lc3NhZ2UgcmVjZWl2ZWQ6ICcsIG1lc3NhZ2UpO1xuICBsZXQgbXNnID0gKHR5cGVvZiBtZXNzYWdlLnRleHQgIT09ICd1bmRlZmluZWQnKSA/IG1lc3NhZ2UudGV4dC5yZXBsYWNlKC9cXG4vZywgJzxicj4nKSA6IG1lc3NhZ2U7XG4gIGxldCBjaGF0U2VjdGlvbiA9ICQoJyMnICsgZW1haWwuc3BsaXQoJ0AnKVswXSkuZmluZCgnLmNoYXQtc2VjdGlvbicpO1xuICBsZXQgbWVzc2FnZXNMaXN0ID0gY2hhdFNlY3Rpb24uZmluZCgnLm1lc3NhZ2VzIC5jb2xsZWN0aW9uJyk7IC8vZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChyZW1vdGVVc2VyKVxuICBsZXQgdHMgPSBNYXRoLnJvdW5kKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLyAxMDAwLCAxMCk7XG4gICQoJyMnICsgZW1haWwuc3BsaXQoJ0AnKVswXSkuZmluZCgnLnN0YXJ0Q2hhdCcpLnJlbW92ZSgpO1xuICBsZXQgbGlzdCA9IGA8bGkgY2xhc3M9XCJjb2xsZWN0aW9uLWl0ZW0gYXZhdGFyIGAgKyAobWVzc2FnZS5pc01lID8gJ2xvY2FsJyA6ICdyZW1vdGUnKSArIGBcIj5cbiAgICA8c3BhbiBjbGFzcz1cInRpbWUtcmVsYXRpdmUgcmlnaHRcIiB0cz1cImAgKyB0cyArIGBcIj5gICsgbW9tZW50LnVuaXgodHMpLmZyb21Ob3coKSArIGA8L3NwYW4+XG4gICAgPHNwYW4gY2xhc3M9XCJ0aXRsZSBsZWZ0XCI+YCArIGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpICsgYDwvc3Bhbj5cbiAgICA8aW1nIHNyYz1cImAgKyBkZWZhdWx0QXZhdGFyICsgYFwiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlXCI+XG4gICAgPHAgY2xhc3M9XCJsZWZ0XCI+YCArIG1zZyArIGA8L3A+XG4gICAgPC9saT5gO1xuICBtZXNzYWdlc0xpc3QuYXBwZW5kKGxpc3QpO1xuICBtZXNzYWdlc0xpc3Quc2Nyb2xsVG9wKG1lc3NhZ2VzTGlzdFswXS5zY3JvbGxIZWlnaHQpO1xufVxuXG4vKipcbiAqIFJldHVybiBuaWNrbmFtZSBjb3JyZXNwb25kaW5nIHRvIGVtYWlsXG4gKi9cbmZ1bmN0aW9uIGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpIHtcbiAgbGV0IHJlcyA9ICcnO1xuICAkLmVhY2godXNlckRpcmVjdG9yeSwgKGksIHYpID0+IHtcbiAgICBpZiAodlswXSA9PT0gZW1haWwpIHtcbiAgICAgIHJlcyA9IHZbMV07XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBGZXRjaCB1c2VyIGluZm9zIGJ5IGVtYWlsICYgZGlzcGxheSB1c2VyIGRldGFpbCBvbiBtYWluIGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gc2hvd1VzZXJEZXRhaWwoZW1haWwpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2hvd1VzZXJEZXRhaWwnLCBlbWFpbCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHVzZXJQcmVmaXggPSBlbWFpbC5zcGxpdCgnQCcpWzBdO1xuICAgIGlmICgkKCcjJyArIHVzZXJQcmVmaXgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYWRkIHRhYiBmb3IgdXNlcicsIGVtYWlsKTtcbiAgICAgICQoJyN0YWItbWFuYWdlcicpLmFwcGVuZCgnPGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiIHJlbD1cIicgKyBlbWFpbCArICdcIj48YSBocmVmPVwiIycgKyB1c2VyUHJlZml4ICsgJ1wiPicgKyB1c2VyUHJlZml4ICsgJzwvYT48L2xpPicpO1xuICAgICAgJCgnI21haW4nKS5hcHBlbmQoJzxkaXYgaWQ9XCInICsgdXNlclByZWZpeCArICdcIiBjbGFzcz1cImNvbCBzMTJcIj48L2Rpdj4nKTtcbiAgICAgIHJldHVybiB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5faHlwZXJ0eURpc2NvdmVyeS5kaXNjb3Zlckh5cGVydHlQZXJVc2VyKGVtYWlsLCAnbG9jYWxob3N0JykudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzaG93IHVzZXIgZGV0YWlsIGZvcicsIGRhdGEpO1xuICAgICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdXNlci1kZXRhaWxzJykudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAkKCcjJyArIHVzZXJQcmVmaXgpLmFwcGVuZCh0ZW1wbGF0ZSh7XG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICB1c2VybmFtZTogZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCksXG4gICAgICAgICAgICBhdmF0YXI6IGRlZmF1bHRBdmF0YXJcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgJCgnI3RhYi1tYW5hZ2VyJykudGFicygnc2VsZWN0X3RhYicsIHVzZXJQcmVmaXgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaCgocmVhc29uKSA9PiB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHRhYiBmb3IgdXNlcicsIGVtYWlsLCAnYWxyZWFkeSBleGlzdCcpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpIHtcblxuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBwcmVwYXJlQ2hhdCcsIGNoYXRHcm91cCwgZW1haWwpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCB1c2VyUHJlZml4ID0gZW1haWwuc3BsaXQoJ0AnKVswXTtcbiAgICBpZiAoJCgnIycgKyB1c2VyUHJlZml4KS5maW5kKCcubWVzc2FnZS1mb3JtJykubGVuZ3RoID4gMCkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgY29udGFpbmVyIGNoYXQgYWxyZWFkeSBleGlzdCBmb3InLCBlbWFpbCk7XG4gICAgICByZXNvbHZlKGNoYXRHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGFkZCBjb250YWluZXIgY2hhdCBmb3InLCBlbWFpbCk7XG4gICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvY2hhdC1zZWN0aW9uJykudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICBsZXQgY29udGFpbmVyRWwgPSAkKCcjJyArIHVzZXJQcmVmaXgpLmZpbmQoJy5jaGF0LXNlY3Rpb24nKTtcbiAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2hpZGUnKS5hcHBlbmQoaHRtbCk7XG5cbiAgICAgICAgbGV0IG1lc3NhZ2VGb3JtID0gY29udGFpbmVyRWwuZmluZCgnLm1lc3NhZ2UtZm9ybScpO1xuICAgICAgICBsZXQgdGV4dEFyZWEgPSBtZXNzYWdlRm9ybS5maW5kKCcubWF0ZXJpYWxpemUtdGV4dGFyZWEnKTtcblxuICAgICAgICB0ZXh0QXJlYS5vbigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzICYmICFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBtZXNzYWdlRm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1lc3NhZ2VGb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIGxldCBtZXNzYWdlID0gbWVzc2FnZUZvcm0uZmluZCgnW25hbWU9XCJtZXNzYWdlXCJdJykudmFsKCk7XG4gICAgICAgICAgY2hhdEdyb3VwLnNlbmRNZXNzYWdlKG1lc3NhZ2UpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBtZXNzYWdlIHNlbnQnLCByZXN1bHQpO1xuICAgICAgICAgICAgbWVzc2FnZUZvcm0uZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICBwcm9jZXNzTWVzc2FnZShlbWFpbCwgcmVzdWx0KTtcbiAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVzb2x2ZShjaGF0R3JvdXApO1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogQ2FsbCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBvcGVuVmlkZW8oaHlwZXJ0eVVSTCkge1xuXG4gIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcbiAgZ2V0VXNlck1lZGlhKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24obWVkaWFTdHJlYW0pIHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyByZWNlaXZlZCBtZWRpYSBzdHJlYW06ICcsIG1lZGlhU3RyZWFtKTtcbiAgICByZXR1cm4gY29ubmVjdG9ySHlwZXJ0eS5pbnN0YW5jZS5jb25uZWN0KGh5cGVydHlVUkwsIG1lZGlhU3RyZWFtKTtcbiAgfSlcbiAgLnRoZW4oZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHNob3dWaWRlbzogJywgY29udHJvbGxlcik7XG4gICAgc2hvd1ZpZGVvKGNvbnRyb2xsZXIpO1xuXG4gICAgY29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdvbjpub3RpZmljYXRpb24nLCBub3RpZmljYXRpb24pO1xuICAgIGNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignb246c3Vic2NyaWJlJywgZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgICAgY29uc29sZS5pbmZvKCdvbjpzdWJzY3JpYmU6ZXZlbnQgJywgY29udHJvbGxlcik7XG4gICAgfSk7XG5cbiAgICBjb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2Nvbm5lY3Rvcjpub3RpZmljYXRpb24nLCBub3RpZmljYXRpb24pO1xuXG4gICAgY29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzdHJlYW06YWRkZWQnLCBwcm9jZXNzVmlkZW8pO1xuXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1ZpZGVvKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHByb2Nlc3NWaWRlbzogJywgZXZlbnQpO1xuXG4gIHZhciBtZXNzYWdlQ2hhdCA9ICQoJy52aWRlby1ob2xkZXInKTtcbiAgdmFyIHZpZGVvID0gbWVzc2FnZUNoYXQuZmluZCgnLnZpZGVvJyk7XG4gIHZpZGVvWzBdLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZXZlbnQuc3RyZWFtKTtcbn1cblxuZnVuY3Rpb24gbm90aWZpY2F0aW9uKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5vdGlmaWNhdGlvbjogJywgZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBub3RpZmljYXRpb25IYW5kbGVyKGNvbnRyb2xsZXIsIGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5vdGlmaWNhdGlvbkhhbmRsZXI6ICcsIGNvbnRyb2xsZXIsIGV2ZW50KTtcbiAgdmFyIGNhbGxlZUluZm8gPSBldmVudC5pZGVudGl0eTtcbiAgdmFyIGluY29taW5nID0gJCgnLm1vZGFsLWNhbGwnKTtcbiAgdmFyIGFjY2VwdEJ0biA9IGluY29taW5nLmZpbmQoJy5idG4tYWNjZXB0Jyk7XG4gIHZhciByZWplY3RCdG4gPSBpbmNvbWluZy5maW5kKCcuYnRuLXJlamVjdCcpO1xuICB2YXIgaW5mb3JtYXRpb25Ib2xkZXIgPSBpbmNvbWluZy5maW5kKCcuaW5mb3JtYXRpb24nKTtcblxuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzaG93VmlkZW86ICcsIGNvbnRyb2xsZXIpO1xuICBzaG93VmlkZW8oY29udHJvbGxlcik7XG5cbiAgY29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzdHJlYW06YWRkZWQnLCBwcm9jZXNzVmlkZW8pO1xuXG4gIGFjY2VwdEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge3ZpZGVvOiB0cnVlLCBhdWRpbzogdHJ1ZX07XG4gICAgZ2V0VXNlck1lZGlhKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24obWVkaWFTdHJlYW0pIHtcbiAgICAgIGNvbnNvbGUuaW5mbygncmVjaXZlZCBtZWRpYSBzdHJlYW06ICcsIG1lZGlhU3RyZWFtKTtcbiAgICAgIHJldHVybiBjb250cm9sbGVyLmFjY2VwdChtZWRpYVN0cmVhbSk7XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICB9KTtcblxuICB9KTtcblxuICByZWplY3RCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXG4gICAgY29udHJvbGxlci5kZWNsaW5lKCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICB9KTtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgdmFyIHBhcnNlSW5mb3JtYXRpb24gPSAnPGRpdiBjbGFzcz1cImNvbCBzMTJcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3cgdmFsaWduLXdyYXBwZXJcIj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbCBzMlwiPicgK1xuICAgICAgICAgICAgJzxpbWcgc3JjPVwiJyArIGNhbGxlZUluZm8uaW5mb1Rva2VuLnBpY3R1cmUgKyAnXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGUgcmVzcG9uc2l2ZS1pbWdcIj4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHMxMFwiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHMzIHRleHQtcmlnaHRcIj5OYW1lOiA8L3NwYW4+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzOSBibGFjay10ZXh0XCI+JyArIGNhbGxlZUluZm8uaW5mb1Rva2VuLm5hbWUgKyAnPC9zcGFuPicgK1xuICAgICAgICAgICAgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczMgdGV4dC1yaWdodFwiPkVtYWlsOiA8L3NwYW4+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzOSBibGFjay10ZXh0XCI+JyArIGNhbGxlZUluZm8uaW5mb1Rva2VuLmVtYWlsICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHMzIHRleHQtcmlnaHRcIj5sb2NhbGU6IDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHM5IGJsYWNrLXRleHRcIj4nICsgY2FsbGVlSW5mby5pbmZvVG9rZW4ubG9jYWxlICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8L3NwYW4+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JztcblxuICBpbmZvcm1hdGlvbkhvbGRlci5odG1sKHBhcnNlSW5mb3JtYXRpb24pO1xuICAkKCcubW9kYWwtY2FsbCcpLm9wZW5Nb2RhbCgpO1xuXG59XG5cbi8vIGZ1bmN0aW9uIHByb2Nlc3NMb2NhbFZpZGVvKGNvbnRyb2xsZXIpIHtcbi8vXG4vLyAgIHZhciBsb2NhbFN0cmVhbXMgPSBjb250cm9sbGVyLmdldExvY2FsU3RyZWFtcztcbi8vICAgZm9yICh2YXIgc3RyZWFtIG9mIGxvY2FsU3RyZWFtcykge1xuLy8gICAgIGNvbnNvbGUubG9nKCdMb2NhbCBzdHJlYW06ICcgKyBzdHJlYW0uaWQpO1xuLy8gICB9XG4vL1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93VmlkZW8oY29udHJvbGxlcikge1xuICB2YXIgdmlkZW9Ib2xkZXIgPSAkKCcudmlkZW8taG9sZGVyJyk7XG4gIHZpZGVvSG9sZGVyLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG5cbiAgdmFyIGJ0bkNhbWVyYSA9IHZpZGVvSG9sZGVyLmZpbmQoJy5jYW1lcmEnKTtcbiAgdmFyIGJ0bk11dGUgPSB2aWRlb0hvbGRlci5maW5kKCcubXV0ZScpO1xuICB2YXIgYnRuTWljID0gdmlkZW9Ib2xkZXIuZmluZCgnLm1pYycpO1xuICB2YXIgYnRuSGFuZ291dCA9IHZpZGVvSG9sZGVyLmZpbmQoJy5oYW5nb3V0Jyk7XG5cbiAgY29uc29sZS5sb2coY29udHJvbGxlcik7XG5cbiAgYnRuQ2FtZXJhLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29udHJvbGxlci5kaXNhYmxlQ2FtKCkudGhlbihmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKHN0YXR1cywgJ2NhbWVyYScpO1xuICAgICAgdmFyIGljb24gPSAndmlkZW9jYW1fb2ZmJztcbiAgICAgIHZhciB0ZXh0ID0gJ0Rpc2FibGUgQ2FtZXJhJztcbiAgICAgIGlmICghc3RhdHVzKSB7XG4gICAgICAgIHRleHQgPSAnRW5hYmxlIENhbWVyYSc7XG4gICAgICAgIGljb24gPSAndmlkZW9jYW0nO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWNvbkVsID0gJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgbGVmdFwiPicgKyBpY29uICsgJzwvaT4nO1xuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5odG1sKGljb25FbCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICB9KTtcblxuICB9KTtcblxuICBidG5NdXRlLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29udHJvbGxlci5tdXRlKCkudGhlbihmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKHN0YXR1cywgJ2F1ZGlvJyk7XG4gICAgICB2YXIgaWNvbiA9ICd2b2x1bWVfb2ZmJztcbiAgICAgIHZhciB0ZXh0ID0gJ0Rpc2FibGUgU291bmQnO1xuICAgICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgICAgdGV4dCA9ICdFbmFibGUgU291bmQnO1xuICAgICAgICBpY29uID0gJ3ZvbHVtZV91cCc7XG4gICAgICB9XG5cbiAgICAgIHZhciBpY29uRWwgPSAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyBsZWZ0XCI+JyArIGljb24gKyAnPC9pPic7XG4gICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmh0bWwoaWNvbkVsKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ211dGUgb3RoZXIgcGVlcicpO1xuXG4gIH0pO1xuXG4gIGJ0bk1pYy5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnRyb2xsZXIuZGlzYWJsZU1pYygpLnRoZW4oZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICBjb25zb2xlLmxvZyhzdGF0dXMsICdtaWMnKTtcbiAgICAgIHZhciBpY29uID0gJ21pY19vZmYnO1xuICAgICAgdmFyIHRleHQgPSAnRGlzYWJsZSBNaWNyb3Bob25lJztcbiAgICAgIGlmICghc3RhdHVzKSB7XG4gICAgICAgIGljb24gPSAnbWljJztcbiAgICAgICAgdGV4dCA9ICdFbmFibGUgTWljcm9waG9uZSc7XG4gICAgICB9XG5cbiAgICAgIHZhciBpY29uRWwgPSAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyBsZWZ0XCI+JyArIGljb24gKyAnPC9pPic7XG4gICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmh0bWwoaWNvbkVsKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG4gIGJ0bkhhbmdvdXQub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnaGFuZ291dCcpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKSB7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXG4gICAgICAudGhlbihmdW5jdGlvbihtZWRpYVN0cmVhbSkge1xuICAgICAgICByZXNvbHZlKG1lZGlhU3RyZWFtKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gIH0pO1xufVxuXG5IYW5kbGViYXJzLmdldFRlbXBsYXRlID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKEhhbmRsZWJhcnMudGVtcGxhdGVzID09PSB1bmRlZmluZWQgfHwgSGFuZGxlYmFycy50ZW1wbGF0ZXNbbmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgSGFuZGxlYmFycy50ZW1wbGF0ZXMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZShIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSk7XG4gICAgfVxuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogbmFtZSArICcuaGJzJyxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgSGFuZGxlYmFycy50ZW1wbGF0ZXNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSk7XG4gICAgICAgIHJlc29sdmUoSGFuZGxlYmFycy50ZW1wbGF0ZXNbbmFtZV0pO1xuICAgICAgfSxcblxuICAgICAgZmFpbDogZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG4iXX0=
