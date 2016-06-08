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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLG9CQUFvQixJQUF4QjtBQUNBLElBQUksY0FBYyxJQUFsQjtBQUNBLElBQUksbUJBQW1CLElBQXZCOztBQUVBLElBQUksZ0JBQWdCLENBQ2hCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRGdCLEVBRWhCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRmdCLEVBR2hCLENBQUMsMEJBQUQsRUFBNkIsYUFBN0IsRUFBNEMsV0FBNUMsQ0FIZ0IsQ0FBcEI7O0FBTUEsSUFBSSxnQkFBZ0IsZUFBcEI7O0FBRUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLE1BQUQsRUFBUyxPQUFUO0FBQUEsa0NBQTRDLE1BQTVDLDZCQUEwRSxPQUExRTtBQUFBLENBQW5COzs7QUFHQSxTQUFTLE1BQVQsR0FBa0I7QUFDaEIsZUFBYSxVQUFiLENBQXdCLFVBQXhCO0FBQ0EsV0FBUyxNQUFULENBQWdCLElBQWhCO0FBQ0Q7O0FBRUQsU0FBUyxRQUFULEdBQW9CO0FBQ2xCLElBQUUsTUFBRixFQUFVLFdBQVYsQ0FBc0IsTUFBdEI7QUFDQSxJQUFFLFVBQUYsRUFBYyxRQUFkLENBQXVCLE1BQXZCO0FBQ0EsSUFBRSxjQUFGLEVBQWtCLElBQWxCLENBQXVCLGFBQWEsT0FBYixDQUFxQixVQUFyQixDQUF2QjtBQUNBO0FBQ0Q7QUFDRCxFQUFFLFlBQVc7QUFDWCxNQUFJLE9BQU8sYUFBYSxRQUFwQixLQUFpQyxXQUFyQyxFQUFrRDtBQUNoRCxZQUFRLEdBQVIsQ0FBWSx3REFBWixFQUFzRSxhQUFhLFFBQW5GO0FBQ0E7QUFDRDtBQUNELElBQUUsdUJBQUYsRUFBMkIsRUFBM0IsQ0FBOEIsT0FBOUIsRUFBdUMsWUFBVztBQUNoRCxNQUFF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Y0FBUyxNQUFULEVBQWlCO0FBQ3JCLGVBQU8sTUFBUDtBQUNEO0FBVEksS0FBUDtBQVdELEdBbEJNLENBQVA7QUFtQkQsQ0FwQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGRvbWFpbiA9ICdsb2NhbGhvc3QnO1xubGV0IHVzZXJTdGF0dXNIeXBlcnR5ID0gbnVsbDtcbmxldCBjaGF0SHlwZXJ0eSA9IG51bGw7XG5sZXQgY29ubmVjdG9ySHlwZXJ0eSA9IG51bGw7XG5cbmxldCB1c2VyRGlyZWN0b3J5ID0gW1xuICAgIFsnb3BlbmlkdGVzdDEwQGdtYWlsLmNvbScsICdUZXN0IE9wZW4gSUQgMTAnLCAnbG9jYWxob3N0J10sXG4gICAgWydvcGVuaWR0ZXN0MjBAZ21haWwuY29tJywgJ1Rlc3QgT3BlbiBJRCAyMCcsICdsb2NhbGhvc3QnXSxcbiAgICBbJ29wZW5pZDEuYXBpemVlQGdtYWlsLmNvbScsICdUZXN0IEFwaXplZScsICdsb2NhbGhvc3QnXVxuXTtcblxubGV0IGRlZmF1bHRBdmF0YXIgPSAnaW1nL3Bob3RvLmpwZyc7XG5cbmNvbnN0IGh5cGVydHlVUkkgPSAoZG9tYWluLCBoeXBlcnR5KSA9PiBgaHlwZXJ0eS1jYXRhbG9ndWU6Ly8ke2RvbWFpbn0vLndlbGwta25vd24vaHlwZXJ0eS8ke2h5cGVydHl9YDtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBsb2dpbiBmb3JtICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXJuYW1lJyk7XG4gIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRBcHAoKSB7XG4gICQoJyNhcHAnKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAkKCcjbG9hZGluZycpLmFkZENsYXNzKCdoaWRlJyk7XG4gICQoJyNjdXJyZW50VXNlcicpLnRleHQobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykpO1xuICBzdGFydFJldGhpbmsoKTtcbn1cbiQoZnVuY3Rpb24oKSB7XG4gIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlLnVzZXJuYW1lICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGFscmVhZHkgbG9nZ2VkIHdpdGguLi4nLCBsb2NhbFN0b3JhZ2UudXNlcm5hbWUpO1xuICAgIHN0YXJ0QXBwKCk7XG4gIH1cbiAgJCgnI2FjY291bnQtZXhhbXBsZSA+IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgJCgnI2VtYWlsJykudmFsKCQodGhpcykuY2hpbGRyZW4oJy5hY2NvdW50LW1haWwnKS50ZXh0KCkpLmZvY3VzKCk7XG4gICAgJCgnI3Bhc3MnKS52YWwoJCh0aGlzKS5jaGlsZHJlbignLmFjY291bnQtcHdkJykudGV4dCgpKS5mb2N1cygpO1xuICB9KTtcbiAgJCgnI2xvZ2luJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYXV0aGVudGljYXRlIHRocm91Z2ggc2VydmljZSB3aXRoLi4uJywgJCgnI2VtYWlsJykudmFsKCkpO1xuICAgIGlmICgkKCcjZW1haWwsI3Bhc3MnKVswXS5jaGVja1ZhbGlkaXR5KCkpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsICQoJyNlbWFpbCcpLnZhbCgpKTtcbiAgICAgIHN0YXJ0QXBwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGZvcm0gaXMgbm90IHZhbGlkLi4uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcjbG9nb3V0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBsb2dvdXQoKTtcbiAgfSk7XG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBBcHAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gc3RhcnRSZXRoaW5rKCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBsb2FkaW5nIHJ1bnRpbWUnKTtcbiAgcmV0aGluay5kZWZhdWx0Lmluc3RhbGwoe1xuICAgIGRvbWFpbjogZG9tYWluLFxuICAgIGRldmVsb3BtZW50OiB0cnVlXG4gIH0pLnRoZW4oKHJ1bnRpbWUpID0+IHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBydW50aW1lJywgcnVudGltZSk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyBoeXBlcnR5JywgaHlwZXJ0eVVSSShkb21haW4sICdVc2VyU3RhdHVzJykpO1xuICAgIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkoaHlwZXJ0eVVSSShkb21haW4sICdVc2VyU3RhdHVzJykpLnRoZW4oKGh5cGVydHkpID0+IHtcbiAgICAgIHVzZXJTdGF0dXNIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgdXNlclN0YXR1c0h5cGVydHkpO1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyBoeXBlcnR5JywgaHlwZXJ0eVVSSShkb21haW4sICdHcm91cENoYXQnKSk7XG4gICAgICByZXR1cm4gcnVudGltZS5yZXF1aXJlSHlwZXJ0eShoeXBlcnR5VVJJKGRvbWFpbiwgJ0dyb3VwQ2hhdCcpKS50aGVuKChoeXBlcnR5KSA9PiB7XG4gICAgICAgIGNoYXRIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCBjaGF0SHlwZXJ0eSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGxvYWRpbmcgaHlwZXJ0eScsIGh5cGVydHlVUkkoZG9tYWluLCAnSHlwZXJ0eUNvbm5lY3RvcicpKTtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkoaHlwZXJ0eVVSSShkb21haW4sICdIeXBlcnR5Q29ubmVjdG9yJykpLnRoZW4oKGh5cGVydHkpID0+IHtcbiAgICAgICAgICBjb25uZWN0b3JIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIGNvbm5lY3Rvckh5cGVydHkpO1xuICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IHNtYXJ0IGJ1c2luZXNzIGFwcCcpO1xuXG4gIC8vIGJpbmQgc3RhdHVzQ2hhbmdlIGV2ZW50IGZvciBwcmVzZW5jZSB1cGRhdGVcbiAgdXNlclN0YXR1c0h5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignc3RhdHVzQ2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgaGFuZGxlIHN0YXR1c0NoYW5nZSBldmVudCBmb3InLCBldmVudCk7XG4gICAgbGV0IGVtYWlsID0gKHR5cGVvZiBldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV2ZW50LmlkZW50aXR5ICE9PSAndW5kZWZpbmVkJykgPyBldmVudC5pZGVudGl0eS5lbWFpbCA6ICdub25lJztcbiAgICAkKCcjdXNlci1saXN0JykuY2hpbGRyZW4oJ1tyZWw9XCInICsgZW1haWwgKyAnXCJdJykucmVtb3ZlQ2xhc3MoJ3N0YXRlLWRpc2Nvbm5lY3RlZCBzdGF0ZS1jb25uZWN0ZWQgc3RhdGUtYnVzeScpLmFkZENsYXNzKCdzdGF0ZS0nICsgZXZlbnQuc3RhdHVzKTtcbiAgICBsZXQgaXRlbXMgPSAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmFkZCgkKCcjdGFiLW1hbmFnZXInKS5maW5kKCdbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpKTtcbiAgICBpZiAoZXZlbnQuc3RhdHVzID09PSAnZGlzY29ubmVjdGVkJykge1xuICAgICAgaXRlbXMuYWRkQ2xhc3MoJ2Rpc2FibGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlbXMucmVtb3ZlQ2xhc3MoJ2Rpc2FibGUnKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGJpbmQgY2hhdCBjcmVhdGlvblxuICBjaGF0SHlwZXJ0eS5pbnN0YW5jZS5vbkludml0ZShmdW5jdGlvbihjaGF0R3JvdXApIHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBkZXRlY3QgaW52aXRlIGZvciBjaGF0JywgY2hhdEdyb3VwKTtcbiAgICBjaGF0R3JvdXAub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5ldyBtZXNzYWdlIHJlY2VpdmVkOiAnLCBtZXNzYWdlKTtcbiAgICAgIGxldCBlbWFpbCA9IG1lc3NhZ2UuX2RhdGFPYmplY3RDaGlsZC5pZGVudGl0eS5lbWFpbDtcbiAgICAgIHNob3dVc2VyRGV0YWlsKGVtYWlsKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpO1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBpZiAoY29ubmVjdG9ySHlwZXJ0eSAhPT0gbnVsbCkge1xuICAgIGNvbm5lY3Rvckh5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignY29ubmVjdG9yOmNvbm5lY3RlZCcsIGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGNvbm5lY3Rvcjpjb25uZWN0ZWQnLCBjb250cm9sbGVyKTtcbiAgICAgIGNvbm5lY3Rvckh5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignaGF2ZTpub3RpZmljYXRpb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBoYXZlOm5vdGlmaWNhdGlvbicsIGV2ZW50KTtcbiAgICAgICAgbm90aWZpY2F0aW9uSGFuZGxlcihjb250cm9sbGVyLCBldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHN0YXJ0IGNoYXRcbiAgJCgnI21haW4nKS5vbignY2xpY2snLCAnLnN0YXJ0Q2hhdCcsIGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbWFpbCA9ICQodGhpcykuY2xvc2VzdCgnLnVzZXItZGV0YWlsJykuYXR0cigncmVsJyk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc3RhcnQgY2hhdCB3aXRoJywgZW1haWwpO1xuICAgIGNoYXRIeXBlcnR5Lmluc3RhbmNlLmNyZWF0ZShlbWFpbCwgW3tlbWFpbDogZW1haWwsIGRvbWFpbjogJ2xvY2FsaG9zdCd9XSkudGhlbigoY2hhdEdyb3VwKSA9PiB7XG4gICAgICBwcmVwYXJlQ2hhdChjaGF0R3JvdXAsIGVtYWlsKS50aGVuKChjaGF0R3JvdXApID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYmluZCBldmVudCBvbk1lc3NhZ2UnKTtcbiAgICAgICAgY2hhdEdyb3VwLm9uTWVzc2FnZSgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG9uIHN0YXJ0YnRuIGV2ZW50IHByb21pc2UnLCBjaGF0R3JvdXApO1xuICAgICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gc3RhcnQgY2FsbFxuICAkKCcjbWFpbicpLm9uKCdjbGljaycsICcuc3RhcnRDYWxsJywgZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVtYWlsID0gJCh0aGlzKS5jbG9zZXN0KCcudXNlci1kZXRhaWwnKS5hdHRyKCdyZWwnKTtcbiAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IGNhbGwgd2l0aCcsIGVtYWlsKTtcbiAgICB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5faHlwZXJ0eURpc2NvdmVyeS5kaXNjb3Zlckh5cGVydHlQZXJVc2VyKGVtYWlsLCAnbG9jYWxob3N0JykudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICBsZXQgdXNlclByZWZpeCA9IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdmlkZW8tc2VjdGlvbicpLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgb3BlblZpZGVvJywgcmVzdWx0KTtcbiAgICAgICAgJCgnIycgKyB1c2VyUHJlZml4KS5maW5kKCcudmlkZW8tc2VjdGlvbicpLmFwcGVuZChodG1sKTtcbiAgICAgICAgb3BlblZpZGVvKHJlc3VsdC5oeXBlcnR5VVJMKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyB1c2VyIGRpcmVjdG9yeSBjbGlja1xuICAkKCcjdXNlci1saXN0Jykub24oJ2NsaWNrJywgJ2E6bm90KC5zdGF0ZS1kaXNjb25uZWN0ZWQpJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZW1haWwgPSAkKHRoaXMpLmF0dHIoJ3JlbCcpO1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHNlYWNoIHVzZXIgaW5mbyBmb3InLCBlbWFpbCk7XG4gICAgc2hvd1VzZXJEZXRhaWwoZW1haWwpO1xuICB9KTtcblxuICAvLyB1c2VyIHN0YXR1cyBjaGFuZ2VcbiAgJCgnI3VzZXItc3RhdHVzLXRvZ2dsZXInKS5maW5kKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5zZXRTdGF0dXMoJCh0aGlzKS5hdHRyKCdyZWwnKSk7XG4gIH0pO1xuXG4gIHVwZGF0ZVJlbGF0aXZlVGltZSgpO1xuICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgdXBkYXRlUmVsYXRpdmVUaW1lKCk7XG4gIH0sIDYwMDAwKTtcblxuICAvLyBmZXRjaCB1c2VyLWNhcmQgdGVtcGxhdGVcbiAgSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSgndHBsL3VzZXItY2FyZCcpLnRoZW4oKHRlbXBsYXRlKSA9PiB7XG4gICAgbGV0IHBhcnRpY2lwYW50cyA9IFtdO1xuICAgICQuZWFjaCh1c2VyRGlyZWN0b3J5LCBmdW5jdGlvbihpLCB2KSB7XG4gICAgICBpZiAodlswXSAhPT0gbG9jYWxTdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICQoJyN1c2VyLWxpc3QnKS5hcHBlbmQodGVtcGxhdGUoe2VtYWlsOiB2WzBdLCB1c2VybmFtZTogdlsxXX0pKTtcbiAgICAgICAgcGFydGljaXBhbnRzLnB1c2goe2VtYWlsOiB2WzBdLCBkb21haW46IHZbMl19KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBpbnZpdGUgZm9yIHVzZXIgcHJlc2VuY2Ugb2snLCBwYXJ0aWNpcGFudHMpO1xuICAgIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLmNyZWF0ZShwYXJ0aWNpcGFudHMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBpbnZpdGUgZm9yIHVzZXIgcHJlc2VuY2Ugb2snLCByZXMpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSZWxhdGl2ZVRpbWUoKSB7XG4gICQoJy50aW1lLXJlbGF0aXZlJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICBsZXQgbXNnID0gJCh0aGlzKTtcbiAgICBsZXQgdGltZU9iaiA9IG1vbWVudC51bml4KG1zZy5hdHRyKCd0cycpKTtcbiAgICBpZiAodGltZU9iai5pc1NhbWUobW9tZW50KCksICdkYXknKSkge1xuICAgICAgbXNnLnRleHQodGltZU9iai5mcm9tTm93KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtc2cudGV4dCh0aW1lT2JqLmZvcm1hdCgnTExMJykpO1xuICAgIH1cbiAgfSk7XG5cbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBjaGF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKSB7XG4gIGNvbnNvbGUuaW5mbygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBuZXcgbWVzc2FnZSByZWNlaXZlZDogJywgbWVzc2FnZSk7XG4gIGxldCBtc2cgPSAodHlwZW9mIG1lc3NhZ2UudGV4dCAhPT0gJ3VuZGVmaW5lZCcpID8gbWVzc2FnZS50ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpIDogbWVzc2FnZTtcbiAgbGV0IGNoYXRTZWN0aW9uID0gJCgnIycgKyBlbWFpbC5zcGxpdCgnQCcpWzBdKS5maW5kKCcuY2hhdC1zZWN0aW9uJyk7XG4gIGxldCBtZXNzYWdlc0xpc3QgPSBjaGF0U2VjdGlvbi5maW5kKCcubWVzc2FnZXMgLmNvbGxlY3Rpb24nKTsgLy9nZXRVc2VyTmlja25hbWVCeUVtYWlsKHJlbW90ZVVzZXIpXG4gIGxldCB0cyA9IE1hdGgucm91bmQoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDAsIDEwKTtcbiAgJCgnIycgKyBlbWFpbC5zcGxpdCgnQCcpWzBdKS5maW5kKCcuc3RhcnRDaGF0JykucmVtb3ZlKCk7XG4gIGxldCBsaXN0ID0gYDxsaSBjbGFzcz1cImNvbGxlY3Rpb24taXRlbSBhdmF0YXIgYCArIChtZXNzYWdlLmlzTWUgPyAnbG9jYWwnIDogJ3JlbW90ZScpICsgYFwiPlxuICAgIDxzcGFuIGNsYXNzPVwidGltZS1yZWxhdGl2ZSByaWdodFwiIHRzPVwiYCArIHRzICsgYFwiPmAgKyBtb21lbnQudW5peCh0cykuZnJvbU5vdygpICsgYDwvc3Bhbj5cbiAgICA8c3BhbiBjbGFzcz1cInRpdGxlIGxlZnRcIj5gICsgZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCkgKyBgPC9zcGFuPlxuICAgIDxpbWcgc3JjPVwiYCArIGRlZmF1bHRBdmF0YXIgKyBgXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICA8cCBjbGFzcz1cImxlZnRcIj5gICsgbXNnICsgYDwvcD5cbiAgICA8L2xpPmA7XG4gIG1lc3NhZ2VzTGlzdC5hcHBlbmQobGlzdCk7XG4gIG1lc3NhZ2VzTGlzdC5zY3JvbGxUb3AobWVzc2FnZXNMaXN0WzBdLnNjcm9sbEhlaWdodCk7XG59XG5cbi8qKlxuICogUmV0dXJuIG5pY2tuYW1lIGNvcnJlc3BvbmRpbmcgdG8gZW1haWxcbiAqL1xuZnVuY3Rpb24gZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCkge1xuICBsZXQgcmVzID0gJyc7XG4gICQuZWFjaCh1c2VyRGlyZWN0b3J5LCAoaSwgdikgPT4ge1xuICAgIGlmICh2WzBdID09PSBlbWFpbCkge1xuICAgICAgcmVzID0gdlsxXTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEZldGNoIHVzZXIgaW5mb3MgYnkgZW1haWwgJiBkaXNwbGF5IHVzZXIgZGV0YWlsIG9uIG1haW4gY29udGVudFxuICovXG5mdW5jdGlvbiBzaG93VXNlckRldGFpbChlbWFpbCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzaG93VXNlckRldGFpbCcsIGVtYWlsKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgdXNlclByZWZpeCA9IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gICAgaWYgKCQoJyMnICsgdXNlclByZWZpeCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBhZGQgdGFiIGZvciB1c2VyJywgZW1haWwpO1xuICAgICAgJCgnI3RhYi1tYW5hZ2VyJykuYXBwZW5kKCc8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCIgcmVsPVwiJyArIGVtYWlsICsgJ1wiPjxhIGhyZWY9XCIjJyArIHVzZXJQcmVmaXggKyAnXCI+JyArIHVzZXJQcmVmaXggKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAkKCcjbWFpbicpLmFwcGVuZCgnPGRpdiBpZD1cIicgKyB1c2VyUHJlZml4ICsgJ1wiIGNsYXNzPVwiY29sIHMxMlwiPjwvZGl2PicpO1xuICAgICAgcmV0dXJuIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLl9oeXBlcnR5RGlzY292ZXJ5LmRpc2NvdmVySHlwZXJ0eVBlclVzZXIoZW1haWwsICdsb2NhbGhvc3QnKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHNob3cgdXNlciBkZXRhaWwgZm9yJywgZGF0YSk7XG4gICAgICAgIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC91c2VyLWRldGFpbHMnKS50aGVuKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICAgICQoJyMnICsgdXNlclByZWZpeCkuYXBwZW5kKHRlbXBsYXRlKHtcbiAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBnZXRVc2VyTmlja25hbWVCeUVtYWlsKGVtYWlsKSxcbiAgICAgICAgICAgIGF2YXRhcjogZGVmYXVsdEF2YXRhclxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAkKCcjdGFiLW1hbmFnZXInKS50YWJzKCdzZWxlY3RfdGFiJywgdXNlclByZWZpeCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKChyZWFzb24pID0+IHtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgdGFiIGZvciB1c2VyJywgZW1haWwsICdhbHJlYWR5IGV4aXN0Jyk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUNoYXQoY2hhdEdyb3VwLCBlbWFpbCkge1xuXG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHByZXBhcmVDaGF0JywgY2hhdEdyb3VwLCBlbWFpbCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHVzZXJQcmVmaXggPSBlbWFpbC5zcGxpdCgnQCcpWzBdO1xuICAgIGlmICgkKCcjJyArIHVzZXJQcmVmaXgpLmZpbmQoJy5tZXNzYWdlLWZvcm0nKS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBjb250YWluZXIgY2hhdCBhbHJlYWR5IGV4aXN0IGZvcicsIGVtYWlsKTtcbiAgICAgIHJlc29sdmUoY2hhdEdyb3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYWRkIGNvbnRhaW5lciBjaGF0IGZvcicsIGVtYWlsKTtcbiAgICAgIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC9jaGF0LXNlY3Rpb24nKS50aGVuKChodG1sKSA9PiB7XG4gICAgICAgIGxldCBjb250YWluZXJFbCA9ICQoJyMnICsgdXNlclByZWZpeCkuZmluZCgnLmNoYXQtc2VjdGlvbicpO1xuICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnaGlkZScpLmFwcGVuZChodG1sKTtcblxuICAgICAgICBsZXQgbWVzc2FnZUZvcm0gPSBjb250YWluZXJFbC5maW5kKCcubWVzc2FnZS1mb3JtJyk7XG4gICAgICAgIGxldCB0ZXh0QXJlYSA9IG1lc3NhZ2VGb3JtLmZpbmQoJy5tYXRlcmlhbGl6ZS10ZXh0YXJlYScpO1xuXG4gICAgICAgIHRleHRBcmVhLm9uKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VGb3JtLnN1Ym1pdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWVzc2FnZUZvcm0ub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSBtZXNzYWdlRm9ybS5maW5kKCdbbmFtZT1cIm1lc3NhZ2VcIl0nKS52YWwoKTtcbiAgICAgICAgICBjaGF0R3JvdXAuc2VuZE1lc3NhZ2UobWVzc2FnZSkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG1lc3NhZ2Ugc2VudCcsIHJlc3VsdCk7XG4gICAgICAgICAgICBtZXNzYWdlRm9ybS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCByZXN1bHQpO1xuICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXNvbHZlKGNoYXRHcm91cCk7XG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBDYWxsICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIG9wZW5WaWRlbyhoeXBlcnR5VVJMKSB7XG5cbiAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt2aWRlbzogdHJ1ZSwgYXVkaW86IHRydWV9O1xuICBnZXRVc2VyTWVkaWEob3B0aW9ucykudGhlbihmdW5jdGlvbihtZWRpYVN0cmVhbSkge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHJlY2VpdmVkIG1lZGlhIHN0cmVhbTogJywgbWVkaWFTdHJlYW0pO1xuICAgIHJldHVybiBjb25uZWN0b3JIeXBlcnR5Lmluc3RhbmNlLmNvbm5lY3QoaHlwZXJ0eVVSTCwgbWVkaWFTdHJlYW0pO1xuICB9KVxuICAudGhlbihmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2hvd1ZpZGVvOiAnLCBjb250cm9sbGVyKTtcbiAgICBzaG93VmlkZW8oY29udHJvbGxlcik7XG5cbiAgICBjb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uOm5vdGlmaWNhdGlvbicsIG5vdGlmaWNhdGlvbik7XG4gICAgY29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdvbjpzdWJzY3JpYmUnLCBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ29uOnN1YnNjcmliZTpldmVudCAnLCBjb250cm9sbGVyKTtcbiAgICB9KTtcblxuICAgIGNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignY29ubmVjdG9yOm5vdGlmaWNhdGlvbicsIG5vdGlmaWNhdGlvbik7XG5cbiAgICBjb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3N0cmVhbTphZGRlZCcsIHByb2Nlc3NWaWRlbyk7XG5cbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzVmlkZW8oZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgcHJvY2Vzc1ZpZGVvOiAnLCBldmVudCk7XG5cbiAgdmFyIG1lc3NhZ2VDaGF0ID0gJCgnLnZpZGVvLWhvbGRlcicpO1xuICB2YXIgdmlkZW8gPSBtZXNzYWdlQ2hhdC5maW5kKCcudmlkZW8nKTtcbiAgdmlkZW9bMF0uc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChldmVudC5zdHJlYW0pO1xufVxuXG5mdW5jdGlvbiBub3RpZmljYXRpb24oZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbm90aWZpY2F0aW9uOiAnLCBldmVudCk7XG59XG5cbmZ1bmN0aW9uIG5vdGlmaWNhdGlvbkhhbmRsZXIoY29udHJvbGxlciwgZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbm90aWZpY2F0aW9uSGFuZGxlcjogJywgY29udHJvbGxlciwgZXZlbnQpO1xuICB2YXIgY2FsbGVlSW5mbyA9IGV2ZW50LmlkZW50aXR5O1xuICB2YXIgaW5jb21pbmcgPSAkKCcubW9kYWwtY2FsbCcpO1xuICB2YXIgYWNjZXB0QnRuID0gaW5jb21pbmcuZmluZCgnLmJ0bi1hY2NlcHQnKTtcbiAgdmFyIHJlamVjdEJ0biA9IGluY29taW5nLmZpbmQoJy5idG4tcmVqZWN0Jyk7XG4gIHZhciBpbmZvcm1hdGlvbkhvbGRlciA9IGluY29taW5nLmZpbmQoJy5pbmZvcm1hdGlvbicpO1xuXG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHNob3dWaWRlbzogJywgY29udHJvbGxlcik7XG4gIHNob3dWaWRlbyhjb250cm9sbGVyKTtcblxuICBjb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3N0cmVhbTphZGRlZCcsIHByb2Nlc3NWaWRlbyk7XG5cbiAgYWNjZXB0QnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcbiAgICBnZXRVc2VyTWVkaWEob3B0aW9ucykudGhlbihmdW5jdGlvbihtZWRpYVN0cmVhbSkge1xuICAgICAgY29uc29sZS5pbmZvKCdyZWNpdmVkIG1lZGlhIHN0cmVhbTogJywgbWVkaWFTdHJlYW0pO1xuICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuYWNjZXB0KG1lZGlhU3RyZWFtKTtcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgIH0pO1xuXG4gIH0pO1xuXG4gIHJlamVjdEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cbiAgICBjb250cm9sbGVyLmRlY2xpbmUoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgIH0pO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICB2YXIgcGFyc2VJbmZvcm1hdGlvbiA9ICc8ZGl2IGNsYXNzPVwiY29sIHMxMlwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInJvdyB2YWxpZ24td3JhcHBlclwiPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sIHMyXCI+JyArXG4gICAgICAgICAgICAnPGltZyBzcmM9XCInICsgY2FsbGVlSW5mby5pbmZvVG9rZW4ucGljdHVyZSArICdcIiBhbHQ9XCJcIiBjbGFzcz1cImNpcmNsZSByZXNwb25zaXZlLWltZ1wiPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczEwXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczMgdGV4dC1yaWdodFwiPk5hbWU6IDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHM5IGJsYWNrLXRleHRcIj4nICsgY2FsbGVlSW5mby5pbmZvVG9rZW4ubmFtZSArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzMyB0ZXh0LXJpZ2h0XCI+RW1haWw6IDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHM5IGJsYWNrLXRleHRcIj4nICsgY2FsbGVlSW5mby5pbmZvVG9rZW4uZW1haWwgKyAnPC9zcGFuPicgK1xuICAgICAgICAgICAgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczMgdGV4dC1yaWdodFwiPmxvY2FsZTogPC9zcGFuPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczkgYmxhY2stdGV4dFwiPicgKyBjYWxsZWVJbmZvLmluZm9Ub2tlbi5sb2NhbGUgKyAnPC9zcGFuPicgK1xuICAgICAgICAgICAgJzwvc3Bhbj4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nO1xuXG4gIGluZm9ybWF0aW9uSG9sZGVyLmh0bWwocGFyc2VJbmZvcm1hdGlvbik7XG4gICQoJy5tb2RhbC1jYWxsJykub3Blbk1vZGFsKCk7XG5cbn1cblxuLy8gZnVuY3Rpb24gcHJvY2Vzc0xvY2FsVmlkZW8oY29udHJvbGxlcikge1xuLy9cbi8vICAgdmFyIGxvY2FsU3RyZWFtcyA9IGNvbnRyb2xsZXIuZ2V0TG9jYWxTdHJlYW1zO1xuLy8gICBmb3IgKHZhciBzdHJlYW0gb2YgbG9jYWxTdHJlYW1zKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ0xvY2FsIHN0cmVhbTogJyArIHN0cmVhbS5pZCk7XG4vLyAgIH1cbi8vXG4vLyB9XG5cbmZ1bmN0aW9uIHNob3dWaWRlbyhjb250cm9sbGVyKSB7XG4gIHZhciB2aWRlb0hvbGRlciA9ICQoJy52aWRlby1ob2xkZXInKTtcbiAgdmlkZW9Ib2xkZXIucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblxuICB2YXIgYnRuQ2FtZXJhID0gdmlkZW9Ib2xkZXIuZmluZCgnLmNhbWVyYScpO1xuICB2YXIgYnRuTXV0ZSA9IHZpZGVvSG9sZGVyLmZpbmQoJy5tdXRlJyk7XG4gIHZhciBidG5NaWMgPSB2aWRlb0hvbGRlci5maW5kKCcubWljJyk7XG4gIHZhciBidG5IYW5nb3V0ID0gdmlkZW9Ib2xkZXIuZmluZCgnLmhhbmdvdXQnKTtcblxuICBjb25zb2xlLmxvZyhjb250cm9sbGVyKTtcblxuICBidG5DYW1lcmEub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb250cm9sbGVyLmRpc2FibGVDYW0oKS50aGVuKGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgY29uc29sZS5sb2coc3RhdHVzLCAnY2FtZXJhJyk7XG4gICAgICB2YXIgaWNvbiA9ICd2aWRlb2NhbV9vZmYnO1xuICAgICAgdmFyIHRleHQgPSAnRGlzYWJsZSBDYW1lcmEnO1xuICAgICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgICAgdGV4dCA9ICdFbmFibGUgQ2FtZXJhJztcbiAgICAgICAgaWNvbiA9ICd2aWRlb2NhbSc7XG4gICAgICB9XG5cbiAgICAgIHZhciBpY29uRWwgPSAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyBsZWZ0XCI+JyArIGljb24gKyAnPC9pPic7XG4gICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmh0bWwoaWNvbkVsKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCByZWFzb24pO1xuICAgIH0pO1xuXG4gIH0pO1xuXG4gIGJ0bk11dGUub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb250cm9sbGVyLm11dGUoKS50aGVuKGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgY29uc29sZS5sb2coc3RhdHVzLCAnYXVkaW8nKTtcbiAgICAgIHZhciBpY29uID0gJ3ZvbHVtZV9vZmYnO1xuICAgICAgdmFyIHRleHQgPSAnRGlzYWJsZSBTb3VuZCc7XG4gICAgICBpZiAoIXN0YXR1cykge1xuICAgICAgICB0ZXh0ID0gJ0VuYWJsZSBTb3VuZCc7XG4gICAgICAgIGljb24gPSAndm9sdW1lX3VwJztcbiAgICAgIH1cblxuICAgICAgdmFyIGljb25FbCA9ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIGxlZnRcIj4nICsgaWNvbiArICc8L2k+JztcbiAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuaHRtbChpY29uRWwpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnbXV0ZSBvdGhlciBwZWVyJyk7XG5cbiAgfSk7XG5cbiAgYnRuTWljLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29udHJvbGxlci5kaXNhYmxlTWljKCkudGhlbihmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKHN0YXR1cywgJ21pYycpO1xuICAgICAgdmFyIGljb24gPSAnbWljX29mZic7XG4gICAgICB2YXIgdGV4dCA9ICdEaXNhYmxlIE1pY3JvcGhvbmUnO1xuICAgICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgICAgaWNvbiA9ICdtaWMnO1xuICAgICAgICB0ZXh0ID0gJ0VuYWJsZSBNaWNyb3Bob25lJztcbiAgICAgIH1cblxuICAgICAgdmFyIGljb25FbCA9ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIGxlZnRcIj4nICsgaWNvbiArICc8L2k+JztcbiAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuaHRtbChpY29uRWwpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSk7XG5cbiAgfSk7XG5cbiAgYnRuSGFuZ291dC5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdoYW5nb3V0Jyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRVc2VyTWVkaWEoY29uc3RyYWludHMpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lZGlhU3RyZWFtKSB7XG4gICAgICAgIHJlc29sdmUobWVkaWFTdHJlYW0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcbiAgfSk7XG59XG5cbkhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoSGFuZGxlYmFycy50ZW1wbGF0ZXMgPT09IHVuZGVmaW5lZCB8fCBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBIYW5kbGViYXJzLnRlbXBsYXRlcyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdKTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBuYW1lICsgJy5oYnMnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKTtcbiAgICAgICAgcmVzb2x2ZShIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSk7XG4gICAgICB9LFxuXG4gICAgICBmYWlsOiBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcbiJdfQ==
