(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var domain = 'localhost';
var userStatusHyperty = null;
var chatHyperty = null;
var connectorHyperty = null;

var userDirectory = [['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'], ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost']];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLG9CQUFvQixJQUF4QjtBQUNBLElBQUksY0FBYyxJQUFsQjtBQUNBLElBQUksbUJBQW1CLElBQXZCOztBQUVBLElBQUksZ0JBQWdCLENBQ2hCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRGdCLEVBRWhCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRmdCLENBQXBCOztBQUtBLElBQUksZ0JBQWdCLGVBQXBCOztBQUVBLElBQU0sYUFBYSxTQUFiLFVBQWEsQ0FBQyxNQUFELEVBQVMsT0FBVDtBQUFBLGtDQUE0QyxNQUE1Qyw2QkFBMEUsT0FBMUU7QUFBQSxDQUFuQjs7O0FBR0EsU0FBUyxNQUFULEdBQWtCO0FBQ2hCLGVBQWEsVUFBYixDQUF3QixVQUF4QjtBQUNBLFdBQVMsTUFBVCxDQUFnQixJQUFoQjtBQUNEOztBQUVELFNBQVMsUUFBVCxHQUFvQjtBQUNsQixJQUFFLE1BQUYsRUFBVSxXQUFWLENBQXNCLE1BQXRCO0FBQ0EsSUFBRSxVQUFGLEVBQWMsUUFBZCxDQUF1QixNQUF2QjtBQUNBLElBQUUsY0FBRixFQUFrQixJQUFsQixDQUF1QixhQUFhLE9BQWIsQ0FBcUIsVUFBckIsQ0FBdkI7QUFDQTtBQUNEO0FBQ0QsRUFBRSxZQUFXO0FBQ1gsTUFBSSxPQUFPLGFBQWEsUUFBcEIsS0FBaUMsV0FBckMsRUFBa0Q7QUFDaEQsWUFBUSxHQUFSLENBQVksd0RBQVosRUFBc0UsYUFBYSxRQUFuRjtBQUNBO0FBQ0Q7QUFDRCxJQUFFLHVCQUFGLEVBQTJCLEVBQTNCLENBQThCLE9BQTlCLEVBQXVDLFlBQVc7QUFDaEQsTUFBRSxRQUFGLEVBQVksR0FBWixDQUFnQixFQUFFLElBQUYsRUFBUSxRQUFSLENBQWlC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Q3JCLGVBQU8sTUFBUDtBQUNEO0FBVEksS0FBUDtBQVdELEdBbEJNLENBQVA7QUFtQkQsQ0FwQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGRvbWFpbiA9ICdsb2NhbGhvc3QnO1xubGV0IHVzZXJTdGF0dXNIeXBlcnR5ID0gbnVsbDtcbmxldCBjaGF0SHlwZXJ0eSA9IG51bGw7XG5sZXQgY29ubmVjdG9ySHlwZXJ0eSA9IG51bGw7XG5cbmxldCB1c2VyRGlyZWN0b3J5ID0gW1xuICAgIFsnb3BlbmlkdGVzdDEwQGdtYWlsLmNvbScsICdUZXN0IE9wZW4gSUQgMTAnLCAnbG9jYWxob3N0J10sXG4gICAgWydvcGVuaWR0ZXN0MjBAZ21haWwuY29tJywgJ1Rlc3QgT3BlbiBJRCAyMCcsICdsb2NhbGhvc3QnXVxuXTtcblxubGV0IGRlZmF1bHRBdmF0YXIgPSAnaW1nL3Bob3RvLmpwZyc7XG5cbmNvbnN0IGh5cGVydHlVUkkgPSAoZG9tYWluLCBoeXBlcnR5KSA9PiBgaHlwZXJ0eS1jYXRhbG9ndWU6Ly8ke2RvbWFpbn0vLndlbGwta25vd24vaHlwZXJ0eS8ke2h5cGVydHl9YDtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBsb2dpbiBmb3JtICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXJuYW1lJyk7XG4gIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRBcHAoKSB7XG4gICQoJyNhcHAnKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAkKCcjbG9hZGluZycpLmFkZENsYXNzKCdoaWRlJyk7XG4gICQoJyNjdXJyZW50VXNlcicpLnRleHQobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykpO1xuICBzdGFydFJldGhpbmsoKTtcbn1cbiQoZnVuY3Rpb24oKSB7XG4gIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlLnVzZXJuYW1lICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGFscmVhZHkgbG9nZ2VkIHdpdGguLi4nLCBsb2NhbFN0b3JhZ2UudXNlcm5hbWUpO1xuICAgIHN0YXJ0QXBwKCk7XG4gIH1cbiAgJCgnI2FjY291bnQtZXhhbXBsZSA+IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgJCgnI2VtYWlsJykudmFsKCQodGhpcykuY2hpbGRyZW4oJy5hY2NvdW50LW1haWwnKS50ZXh0KCkpLmZvY3VzKCk7XG4gICAgJCgnI3Bhc3MnKS52YWwoJCh0aGlzKS5jaGlsZHJlbignLmFjY291bnQtcHdkJykudGV4dCgpKS5mb2N1cygpO1xuICB9KTtcbiAgJCgnI2xvZ2luJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYXV0aGVudGljYXRlIHRocm91Z2ggc2VydmljZSB3aXRoLi4uJywgJCgnI2VtYWlsJykudmFsKCkpO1xuICAgIGlmICgkKCcjZW1haWwsI3Bhc3MnKVswXS5jaGVja1ZhbGlkaXR5KCkpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsICQoJyNlbWFpbCcpLnZhbCgpKTtcbiAgICAgIHN0YXJ0QXBwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGZvcm0gaXMgbm90IHZhbGlkLi4uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcjbG9nb3V0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBsb2dvdXQoKTtcbiAgfSk7XG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBBcHAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gc3RhcnRSZXRoaW5rKCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBsb2FkaW5nIHJ1bnRpbWUnKTtcbiAgcmV0aGluay5kZWZhdWx0Lmluc3RhbGwoe1xuICAgIGRvbWFpbjogZG9tYWluLFxuICAgIGRldmVsb3BtZW50OiB0cnVlXG4gIH0pLnRoZW4oKHJ1bnRpbWUpID0+IHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBydW50aW1lJywgcnVudGltZSk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyBoeXBlcnR5JywgaHlwZXJ0eVVSSShkb21haW4sICdVc2VyU3RhdHVzJykpO1xuICAgIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkoaHlwZXJ0eVVSSShkb21haW4sICdVc2VyU3RhdHVzJykpLnRoZW4oKGh5cGVydHkpID0+IHtcbiAgICAgIHVzZXJTdGF0dXNIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgdXNlclN0YXR1c0h5cGVydHkpO1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbG9hZGluZyBoeXBlcnR5JywgaHlwZXJ0eVVSSShkb21haW4sICdHcm91cENoYXQnKSk7XG4gICAgICByZXR1cm4gcnVudGltZS5yZXF1aXJlSHlwZXJ0eShoeXBlcnR5VVJJKGRvbWFpbiwgJ0dyb3VwQ2hhdCcpKS50aGVuKChoeXBlcnR5KSA9PiB7XG4gICAgICAgIGNoYXRIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnLCBjaGF0SHlwZXJ0eSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGxvYWRpbmcgaHlwZXJ0eScsIGh5cGVydHlVUkkoZG9tYWluLCAnSHlwZXJ0eUNvbm5lY3RvcicpKTtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkoaHlwZXJ0eVVSSShkb21haW4sICdIeXBlcnR5Q29ubmVjdG9yJykpLnRoZW4oKGh5cGVydHkpID0+IHtcbiAgICAgICAgICBjb25uZWN0b3JIeXBlcnR5ID0gaHlwZXJ0eTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIGNvbm5lY3Rvckh5cGVydHkpO1xuICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IHNtYXJ0IGJ1c2luZXNzIGFwcCcpO1xuXG4gIC8vIGJpbmQgY2hhdCBjcmVhdGlvblxuICBjaGF0SHlwZXJ0eS5pbnN0YW5jZS5vbkludml0ZShmdW5jdGlvbihjaGF0R3JvdXApIHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBkZXRlY3QgaW52aXRlIGZvciBjaGF0JywgY2hhdEdyb3VwKTtcbiAgICBjaGF0R3JvdXAub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5ldyBtZXNzYWdlIHJlY2VpdmVkOiAnLCBtZXNzYWdlKTtcbiAgICAgIGxldCBlbWFpbCA9IG1lc3NhZ2UuX2RhdGFPYmplY3RDaGlsZC5pZGVudGl0eS5lbWFpbDtcbiAgICAgIHNob3dVc2VyRGV0YWlsKGVtYWlsKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHByZXBhcmVDaGF0KGNoYXRHcm91cCwgZW1haWwpO1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBpZiAoY29ubmVjdG9ySHlwZXJ0eSAhPT0gbnVsbCkge1xuICAgIGNvbm5lY3Rvckh5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignY29ubmVjdG9yOmNvbm5lY3RlZCcsIGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGNvbm5lY3Rvcjpjb25uZWN0ZWQnLCBjb250cm9sbGVyKTtcbiAgICAgIGNvbm5lY3Rvckh5cGVydHkuaW5zdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcignaGF2ZTpub3RpZmljYXRpb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBoYXZlOm5vdGlmaWNhdGlvbicsIGV2ZW50KTtcbiAgICAgICAgbm90aWZpY2F0aW9uSGFuZGxlcihjb250cm9sbGVyLCBldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHN0YXJ0IGNoYXRcbiAgJCgnI21haW4nKS5vbignY2xpY2snLCAnLnN0YXJ0Q2hhdCcsIGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbWFpbCA9ICQodGhpcykuY2xvc2VzdCgnLnVzZXItZGV0YWlsJykuYXR0cigncmVsJyk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc3RhcnQgY2hhdCB3aXRoJywgZW1haWwpO1xuICAgIGNoYXRIeXBlcnR5Lmluc3RhbmNlLmNyZWF0ZShlbWFpbCwgW3tlbWFpbDogZW1haWwsIGRvbWFpbjogJ2xvY2FsaG9zdCd9XSkudGhlbigoY2hhdEdyb3VwKSA9PiB7XG4gICAgICBwcmVwYXJlQ2hhdChjaGF0R3JvdXAsIGVtYWlsKS50aGVuKChjaGF0R3JvdXApID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgYmluZCBldmVudCBvbk1lc3NhZ2UnKTtcbiAgICAgICAgY2hhdEdyb3VwLm9uTWVzc2FnZSgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG9uIHN0YXJ0YnRuIGV2ZW50IHByb21pc2UnLCBjaGF0R3JvdXApO1xuICAgICAgICAgIHByb2Nlc3NNZXNzYWdlKGVtYWlsLCBtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gc3RhcnQgY2FsbFxuICAkKCcjbWFpbicpLm9uKCdjbGljaycsICcuc3RhcnRDYWxsJywgZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVtYWlsID0gJCh0aGlzKS5jbG9zZXN0KCcudXNlci1kZXRhaWwnKS5hdHRyKCdyZWwnKTtcbiAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHN0YXJ0IGNhbGwgd2l0aCcsIGVtYWlsKTtcbiAgICB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5faHlwZXJ0eURpc2NvdmVyeS5kaXNjb3Zlckh5cGVydHlQZXJVc2VyKGVtYWlsLCAnbG9jYWxob3N0JykudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICBsZXQgdXNlclByZWZpeCA9IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdmlkZW8tc2VjdGlvbicpLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgb3BlblZpZGVvJywgcmVzdWx0KTtcbiAgICAgICAgJCgnIycgKyB1c2VyUHJlZml4KS5maW5kKCcudmlkZW8tc2VjdGlvbicpLmFwcGVuZChodG1sKTtcbiAgICAgICAgb3BlblZpZGVvKHJlc3VsdC5oeXBlcnR5VVJMKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyB1c2VyIGRpcmVjdG9yeSBjbGlja1xuICAkKCcjdXNlci1saXN0Jykub24oJ2NsaWNrJywgJ2E6bm90KC5zdGF0ZS11bmF2YWlsYWJsZSwuc3RhdGUtYXdheSknLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBlbWFpbCA9ICQodGhpcykuYXR0cigncmVsJyk7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2VhY2ggdXNlciBpbmZvIGZvcicsIGVtYWlsKTtcbiAgICBzaG93VXNlckRldGFpbChlbWFpbCk7XG4gIH0pO1xuXG4gIC8vIHVzZXIgc3RhdHVzIGNoYW5nZVxuICAkKCcjdXNlci1zdGF0dXMtdG9nZ2xlcicpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVzZXJTdGF0dXNIeXBlcnR5Lmluc3RhbmNlLnNldFN0YXR1cygkKHRoaXMpLmF0dHIoJ3JlbCcpKTtcbiAgfSk7XG5cbiAgdXBkYXRlUmVsYXRpdmVUaW1lKCk7XG4gIHNldEludGVydmFsKCgpID0+IHtcbiAgICB1cGRhdGVSZWxhdGl2ZVRpbWUoKTtcbiAgfSwgNjAwMDApO1xuXG4gIC8vIGZldGNoIHVzZXItY2FyZCB0ZW1wbGF0ZVxuICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdXNlci1jYXJkJykudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICBsZXQgcGFydGljaXBhbnRzID0gW107XG4gICAgJC5lYWNoKHVzZXJEaXJlY3RvcnksIGZ1bmN0aW9uKGksIHYpIHtcbiAgICAgIGlmICh2WzBdICE9PSBsb2NhbFN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgJCgnI3VzZXItbGlzdCcpLmFwcGVuZCh0ZW1wbGF0ZSh7ZW1haWw6IHZbMF0sIHVzZXJuYW1lOiB2WzFdfSkpO1xuICAgICAgICBwYXJ0aWNpcGFudHMucHVzaCh7ZW1haWw6IHZbMF0sIGRvbWFpbjogdlsyXX0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGludml0ZSBmb3IgdXNlciBwcmVzZW5jZSBvaycsIHBhcnRpY2lwYW50cyk7XG4gICAgdXNlclN0YXR1c0h5cGVydHkuaW5zdGFuY2UuY3JlYXRlKHBhcnRpY2lwYW50cykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGludml0ZSBmb3IgdXNlciBwcmVzZW5jZSBvaycsIHJlcyk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gYmluZCBzdGF0dXNDaGFuZ2UgZXZlbnQgZm9yIHByZXNlbmNlIHVwZGF0ZVxuICB1c2VyU3RhdHVzSHlwZXJ0eS5pbnN0YW5jZS5hZGRFdmVudExpc3RlbmVyKCdzdGF0dXNDaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBoYW5kbGUgc3RhdHVzQ2hhbmdlIGV2ZW50IGZvcicsIGV2ZW50KTtcbiAgICBsZXQgZW1haWwgPSAodHlwZW9mIGV2ZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXZlbnQuaWRlbnRpdHkgIT09ICd1bmRlZmluZWQnKSA/IGV2ZW50LmlkZW50aXR5LmVtYWlsIDogJ25vbmUnO1xuICAgICQoJyN1c2VyLWxpc3QnKS5jaGlsZHJlbignW3JlbD1cIicgKyBlbWFpbCArICdcIl0nKS5yZW1vdmVDbGFzcygnc3RhdGUtYXZhaWxhYmxlIHN0YXRlLXVuYXZhaWxhYmxlIHN0YXRlLWJ1c3kgc3RhdGUtYXdheScpLmFkZENsYXNzKCdzdGF0ZS0nICsgZXZlbnQuc3RhdHVzKTtcbiAgICBsZXQgaXRlbXMgPSAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmFkZCgkKCcjdGFiLW1hbmFnZXInKS5maW5kKCdbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpKTtcbiAgICBpZiAoZXZlbnQuc3RhdHVzID09PSAndW5hdmFpbGFibGUnIHx8IGV2ZW50LnN0YXR1cyA9PT0gJ2F3YXknKSB7XG4gICAgICBpdGVtcy5hZGRDbGFzcygnZGlzYWJsZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtcy5yZW1vdmVDbGFzcygnZGlzYWJsZScpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVJlbGF0aXZlVGltZSgpIHtcbiAgJCgnLnRpbWUtcmVsYXRpdmUnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGxldCBtc2cgPSAkKHRoaXMpO1xuICAgIGxldCB0aW1lT2JqID0gbW9tZW50LnVuaXgobXNnLmF0dHIoJ3RzJykpO1xuICAgIGlmICh0aW1lT2JqLmlzU2FtZShtb21lbnQoKSwgJ2RheScpKSB7XG4gICAgICBtc2cudGV4dCh0aW1lT2JqLmZyb21Ob3coKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1zZy50ZXh0KHRpbWVPYmouZm9ybWF0KCdMTEwnKSk7XG4gICAgfVxuICB9KTtcblxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIGNoYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gcHJvY2Vzc01lc3NhZ2UoZW1haWwsIG1lc3NhZ2UpIHtcbiAgY29uc29sZS5pbmZvKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIG5ldyBtZXNzYWdlIHJlY2VpdmVkOiAnLCBtZXNzYWdlKTtcbiAgbGV0IG1zZyA9ICh0eXBlb2YgbWVzc2FnZS50ZXh0ICE9PSAndW5kZWZpbmVkJykgPyBtZXNzYWdlLnRleHQucmVwbGFjZSgvXFxuL2csICc8YnI+JykgOiBtZXNzYWdlO1xuICBsZXQgY2hhdFNlY3Rpb24gPSAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmZpbmQoJy5jaGF0LXNlY3Rpb24nKTtcbiAgbGV0IG1lc3NhZ2VzTGlzdCA9IGNoYXRTZWN0aW9uLmZpbmQoJy5tZXNzYWdlcyAuY29sbGVjdGlvbicpOyAvL2dldFVzZXJOaWNrbmFtZUJ5RW1haWwocmVtb3RlVXNlcilcbiAgbGV0IHRzID0gTWF0aC5yb3VuZCgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMCwgMTApO1xuICAkKCcjJyArIGVtYWlsLnNwbGl0KCdAJylbMF0pLmZpbmQoJy5zdGFydENoYXQnKS5yZW1vdmUoKTtcbiAgbGV0IGxpc3QgPSBgPGxpIGNsYXNzPVwiY29sbGVjdGlvbi1pdGVtIGF2YXRhciBgICsgKG1lc3NhZ2UuaXNNZSA/ICdsb2NhbCcgOiAncmVtb3RlJykgKyBgXCI+XG4gICAgPHNwYW4gY2xhc3M9XCJ0aW1lLXJlbGF0aXZlIHJpZ2h0XCIgdHM9XCJgICsgdHMgKyBgXCI+YCArIG1vbWVudC51bml4KHRzKS5mcm9tTm93KCkgKyBgPC9zcGFuPlxuICAgIDxzcGFuIGNsYXNzPVwidGl0bGUgbGVmdFwiPmAgKyBnZXRVc2VyTmlja25hbWVCeUVtYWlsKGVtYWlsKSArIGA8L3NwYW4+XG4gICAgPGltZyBzcmM9XCJgICsgZGVmYXVsdEF2YXRhciArIGBcIiBhbHQ9XCJcIiBjbGFzcz1cImNpcmNsZVwiPlxuICAgIDxwIGNsYXNzPVwibGVmdFwiPmAgKyBtc2cgKyBgPC9wPlxuICAgIDwvbGk+YDtcbiAgbWVzc2FnZXNMaXN0LmFwcGVuZChsaXN0KTtcbiAgbWVzc2FnZXNMaXN0LnNjcm9sbFRvcChtZXNzYWdlc0xpc3RbMF0uc2Nyb2xsSGVpZ2h0KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gbmlja25hbWUgY29ycmVzcG9uZGluZyB0byBlbWFpbFxuICovXG5mdW5jdGlvbiBnZXRVc2VyTmlja25hbWVCeUVtYWlsKGVtYWlsKSB7XG4gIGxldCByZXMgPSAnJztcbiAgJC5lYWNoKHVzZXJEaXJlY3RvcnksIChpLCB2KSA9PiB7XG4gICAgaWYgKHZbMF0gPT09IGVtYWlsKSB7XG4gICAgICByZXMgPSB2WzFdO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogRmV0Y2ggdXNlciBpbmZvcyBieSBlbWFpbCAmIGRpc3BsYXkgdXNlciBkZXRhaWwgb24gbWFpbiBjb250ZW50XG4gKi9cbmZ1bmN0aW9uIHNob3dVc2VyRGV0YWlsKGVtYWlsKSB7XG4gIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIHNob3dVc2VyRGV0YWlsJywgZW1haWwpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCB1c2VyUHJlZml4ID0gZW1haWwuc3BsaXQoJ0AnKVswXTtcbiAgICBpZiAoJCgnIycgKyB1c2VyUHJlZml4KS5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGFkZCB0YWIgZm9yIHVzZXInLCBlbWFpbCk7XG4gICAgICAkKCcjdGFiLW1hbmFnZXInKS5hcHBlbmQoJzxsaSBjbGFzcz1cInRhYiBjb2wgczNcIiByZWw9XCInICsgZW1haWwgKyAnXCI+PGEgaHJlZj1cIiMnICsgdXNlclByZWZpeCArICdcIj4nICsgdXNlclByZWZpeCArICc8L2E+PC9saT4nKTtcbiAgICAgICQoJyNtYWluJykuYXBwZW5kKCc8ZGl2IGlkPVwiJyArIHVzZXJQcmVmaXggKyAnXCIgY2xhc3M9XCJjb2wgczEyXCI+PC9kaXY+Jyk7XG4gICAgICByZXR1cm4gdXNlclN0YXR1c0h5cGVydHkuaW5zdGFuY2UuX2h5cGVydHlEaXNjb3ZlcnkuZGlzY292ZXJIeXBlcnR5UGVyVXNlcihlbWFpbCwgJ2xvY2FsaG9zdCcpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2hvdyB1c2VyIGRldGFpbCBmb3InLCBkYXRhKTtcbiAgICAgICAgSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSgndHBsL3VzZXItZGV0YWlscycpLnRoZW4oKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgICAgJCgnIycgKyB1c2VyUHJlZml4KS5hcHBlbmQodGVtcGxhdGUoe1xuICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgdXNlcm5hbWU6IGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpLFxuICAgICAgICAgICAgYXZhdGFyOiBkZWZhdWx0QXZhdGFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgICQoJyN0YWItbWFuYWdlcicpLnRhYnMoJ3NlbGVjdF90YWInLCB1c2VyUHJlZml4KTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goKHJlYXNvbikgPT4ge1xuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyB0YWIgZm9yIHVzZXInLCBlbWFpbCwgJ2FscmVhZHkgZXhpc3QnKTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlQ2hhdChjaGF0R3JvdXAsIGVtYWlsKSB7XG5cbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgcHJlcGFyZUNoYXQnLCBjaGF0R3JvdXAsIGVtYWlsKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgdXNlclByZWZpeCA9IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gICAgaWYgKCQoJyMnICsgdXNlclByZWZpeCkuZmluZCgnLm1lc3NhZ2UtZm9ybScpLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIGNvbnRhaW5lciBjaGF0IGFscmVhZHkgZXhpc3QgZm9yJywgZW1haWwpO1xuICAgICAgcmVzb2x2ZShjaGF0R3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBhZGQgY29udGFpbmVyIGNoYXQgZm9yJywgZW1haWwpO1xuICAgICAgSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSgndHBsL2NoYXQtc2VjdGlvbicpLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgbGV0IGNvbnRhaW5lckVsID0gJCgnIycgKyB1c2VyUHJlZml4KS5maW5kKCcuY2hhdC1zZWN0aW9uJyk7XG4gICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdoaWRlJykuYXBwZW5kKGh0bWwpO1xuXG4gICAgICAgIGxldCBtZXNzYWdlRm9ybSA9IGNvbnRhaW5lckVsLmZpbmQoJy5tZXNzYWdlLWZvcm0nKTtcbiAgICAgICAgbGV0IHRleHRBcmVhID0gbWVzc2FnZUZvcm0uZmluZCgnLm1hdGVyaWFsaXplLXRleHRhcmVhJyk7XG5cbiAgICAgICAgdGV4dEFyZWEub24oJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyAmJiAhZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgbWVzc2FnZUZvcm0uc3VibWl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBtZXNzYWdlRm9ybS5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICBsZXQgbWVzc2FnZSA9IG1lc3NhZ2VGb3JtLmZpbmQoJ1tuYW1lPVwibWVzc2FnZVwiXScpLnZhbCgpO1xuICAgICAgICAgIGNoYXRHcm91cC5zZW5kTWVzc2FnZShtZXNzYWdlKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgbWVzc2FnZSBzZW50JywgcmVzdWx0KTtcbiAgICAgICAgICAgIG1lc3NhZ2VGb3JtLmdldCgwKS5yZXNldCgpO1xuICAgICAgICAgICAgcHJvY2Vzc01lc3NhZ2UoZW1haWwsIHJlc3VsdCk7XG4gICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc29sdmUoY2hhdEdyb3VwKTtcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgcmVqZWN0KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIENhbGwgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gb3BlblZpZGVvKGh5cGVydHlVUkwpIHtcblxuICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge3ZpZGVvOiB0cnVlLCBhdWRpbzogdHJ1ZX07XG4gIGdldFVzZXJNZWRpYShvcHRpb25zKS50aGVuKGZ1bmN0aW9uKG1lZGlhU3RyZWFtKSB7XG4gICAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgcmVjZWl2ZWQgbWVkaWEgc3RyZWFtOiAnLCBtZWRpYVN0cmVhbSk7XG4gICAgcmV0dXJuIGNvbm5lY3Rvckh5cGVydHkuaW5zdGFuY2UuY29ubmVjdChoeXBlcnR5VVJMLCBtZWRpYVN0cmVhbSk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBzaG93VmlkZW86ICcsIGNvbnRyb2xsZXIpO1xuICAgIHNob3dWaWRlbyhjb250cm9sbGVyKTtcblxuICAgIGNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignb246bm90aWZpY2F0aW9uJywgbm90aWZpY2F0aW9uKTtcbiAgICBjb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uOnN1YnNjcmliZScsIGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnb246c3Vic2NyaWJlOmV2ZW50ICcsIGNvbnRyb2xsZXIpO1xuICAgIH0pO1xuXG4gICAgY29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdjb25uZWN0b3I6bm90aWZpY2F0aW9uJywgbm90aWZpY2F0aW9uKTtcblxuICAgIGNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RyZWFtOmFkZGVkJywgcHJvY2Vzc1ZpZGVvKTtcblxuICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICBjb25zb2xlLmVycm9yKCcjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjJywgcmVhc29uKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NWaWRlbyhldmVudCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBwcm9jZXNzVmlkZW86ICcsIGV2ZW50KTtcblxuICB2YXIgbWVzc2FnZUNoYXQgPSAkKCcudmlkZW8taG9sZGVyJyk7XG4gIHZhciB2aWRlbyA9IG1lc3NhZ2VDaGF0LmZpbmQoJy52aWRlbycpO1xuICB2aWRlb1swXS5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGV2ZW50LnN0cmVhbSk7XG59XG5cbmZ1bmN0aW9uIG5vdGlmaWNhdGlvbihldmVudCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBub3RpZmljYXRpb246ICcsIGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gbm90aWZpY2F0aW9uSGFuZGxlcihjb250cm9sbGVyLCBldmVudCkge1xuICBjb25zb2xlLmxvZygnIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBub3RpZmljYXRpb25IYW5kbGVyOiAnLCBjb250cm9sbGVyLCBldmVudCk7XG4gIHZhciBjYWxsZWVJbmZvID0gZXZlbnQuaWRlbnRpdHk7XG4gIHZhciBpbmNvbWluZyA9ICQoJy5tb2RhbC1jYWxsJyk7XG4gIHZhciBhY2NlcHRCdG4gPSBpbmNvbWluZy5maW5kKCcuYnRuLWFjY2VwdCcpO1xuICB2YXIgcmVqZWN0QnRuID0gaW5jb21pbmcuZmluZCgnLmJ0bi1yZWplY3QnKTtcbiAgdmFyIGluZm9ybWF0aW9uSG9sZGVyID0gaW5jb21pbmcuZmluZCgnLmluZm9ybWF0aW9uJyk7XG5cbiAgY29uc29sZS5sb2coJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgc2hvd1ZpZGVvOiAnLCBjb250cm9sbGVyKTtcbiAgc2hvd1ZpZGVvKGNvbnRyb2xsZXIpO1xuXG4gIGNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RyZWFtOmFkZGVkJywgcHJvY2Vzc1ZpZGVvKTtcblxuICBhY2NlcHRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt2aWRlbzogdHJ1ZSwgYXVkaW86IHRydWV9O1xuICAgIGdldFVzZXJNZWRpYShvcHRpb25zKS50aGVuKGZ1bmN0aW9uKG1lZGlhU3RyZWFtKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ3JlY2l2ZWQgbWVkaWEgc3RyZWFtOiAnLCBtZWRpYVN0cmVhbSk7XG4gICAgICByZXR1cm4gY29udHJvbGxlci5hY2NlcHQobWVkaWFTdHJlYW0pO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gICAgfSk7XG5cbiAgfSk7XG5cbiAgcmVqZWN0QnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblxuICAgIGNvbnRyb2xsZXIuZGVjbGluZSgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gICAgfSk7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIHZhciBwYXJzZUluZm9ybWF0aW9uID0gJzxkaXYgY2xhc3M9XCJjb2wgczEyXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93IHZhbGlnbi13cmFwcGVyXCI+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wgczJcIj4nICtcbiAgICAgICAgICAgICc8aW1nIHNyYz1cIicgKyBjYWxsZWVJbmZvLmluZm9Ub2tlbi5waWN0dXJlICsgJ1wiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlIHJlc3BvbnNpdmUtaW1nXCI+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzMTBcIj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzMyB0ZXh0LXJpZ2h0XCI+TmFtZTogPC9zcGFuPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczkgYmxhY2stdGV4dFwiPicgKyBjYWxsZWVJbmZvLmluZm9Ub2tlbi5uYW1lICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY29sIHMzIHRleHQtcmlnaHRcIj5FbWFpbDogPC9zcGFuPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJjb2wgczkgYmxhY2stdGV4dFwiPicgKyBjYWxsZWVJbmZvLmluZm9Ub2tlbi5lbWFpbCArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9zcGFuPicgK1xuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzMyB0ZXh0LXJpZ2h0XCI+bG9jYWxlOiA8L3NwYW4+JyArXG4gICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImNvbCBzOSBibGFjay10ZXh0XCI+JyArIGNhbGxlZUluZm8uaW5mb1Rva2VuLmxvY2FsZSArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9zcGFuPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2Pic7XG5cbiAgaW5mb3JtYXRpb25Ib2xkZXIuaHRtbChwYXJzZUluZm9ybWF0aW9uKTtcbiAgJCgnLm1vZGFsLWNhbGwnKS5vcGVuTW9kYWwoKTtcblxufVxuXG4vLyBmdW5jdGlvbiBwcm9jZXNzTG9jYWxWaWRlbyhjb250cm9sbGVyKSB7XG4vL1xuLy8gICB2YXIgbG9jYWxTdHJlYW1zID0gY29udHJvbGxlci5nZXRMb2NhbFN0cmVhbXM7XG4vLyAgIGZvciAodmFyIHN0cmVhbSBvZiBsb2NhbFN0cmVhbXMpIHtcbi8vICAgICBjb25zb2xlLmxvZygnTG9jYWwgc3RyZWFtOiAnICsgc3RyZWFtLmlkKTtcbi8vICAgfVxuLy9cbi8vIH1cblxuZnVuY3Rpb24gc2hvd1ZpZGVvKGNvbnRyb2xsZXIpIHtcbiAgdmFyIHZpZGVvSG9sZGVyID0gJCgnLnZpZGVvLWhvbGRlcicpO1xuICB2aWRlb0hvbGRlci5yZW1vdmVDbGFzcygnaGlkZScpO1xuXG4gIHZhciBidG5DYW1lcmEgPSB2aWRlb0hvbGRlci5maW5kKCcuY2FtZXJhJyk7XG4gIHZhciBidG5NdXRlID0gdmlkZW9Ib2xkZXIuZmluZCgnLm11dGUnKTtcbiAgdmFyIGJ0bk1pYyA9IHZpZGVvSG9sZGVyLmZpbmQoJy5taWMnKTtcbiAgdmFyIGJ0bkhhbmdvdXQgPSB2aWRlb0hvbGRlci5maW5kKCcuaGFuZ291dCcpO1xuXG4gIGNvbnNvbGUubG9nKGNvbnRyb2xsZXIpO1xuXG4gIGJ0bkNhbWVyYS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnRyb2xsZXIuZGlzYWJsZUNhbSgpLnRoZW4oZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICBjb25zb2xlLmxvZyhzdGF0dXMsICdjYW1lcmEnKTtcbiAgICAgIHZhciBpY29uID0gJ3ZpZGVvY2FtX29mZic7XG4gICAgICB2YXIgdGV4dCA9ICdEaXNhYmxlIENhbWVyYSc7XG4gICAgICBpZiAoIXN0YXR1cykge1xuICAgICAgICB0ZXh0ID0gJ0VuYWJsZSBDYW1lcmEnO1xuICAgICAgICBpY29uID0gJ3ZpZGVvY2FtJztcbiAgICAgIH1cblxuICAgICAgdmFyIGljb25FbCA9ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIGxlZnRcIj4nICsgaWNvbiArICc8L2k+JztcbiAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuaHRtbChpY29uRWwpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgY29uc29sZS5lcnJvcignIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIycsIHJlYXNvbik7XG4gICAgfSk7XG5cbiAgfSk7XG5cbiAgYnRuTXV0ZS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnRyb2xsZXIubXV0ZSgpLnRoZW4oZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICBjb25zb2xlLmxvZyhzdGF0dXMsICdhdWRpbycpO1xuICAgICAgdmFyIGljb24gPSAndm9sdW1lX29mZic7XG4gICAgICB2YXIgdGV4dCA9ICdEaXNhYmxlIFNvdW5kJztcbiAgICAgIGlmICghc3RhdHVzKSB7XG4gICAgICAgIHRleHQgPSAnRW5hYmxlIFNvdW5kJztcbiAgICAgICAgaWNvbiA9ICd2b2x1bWVfdXAnO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWNvbkVsID0gJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgbGVmdFwiPicgKyBpY29uICsgJzwvaT4nO1xuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5odG1sKGljb25FbCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdtdXRlIG90aGVyIHBlZXInKTtcblxuICB9KTtcblxuICBidG5NaWMub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb250cm9sbGVyLmRpc2FibGVNaWMoKS50aGVuKGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgY29uc29sZS5sb2coc3RhdHVzLCAnbWljJyk7XG4gICAgICB2YXIgaWNvbiA9ICdtaWNfb2ZmJztcbiAgICAgIHZhciB0ZXh0ID0gJ0Rpc2FibGUgTWljcm9waG9uZSc7XG4gICAgICBpZiAoIXN0YXR1cykge1xuICAgICAgICBpY29uID0gJ21pYyc7XG4gICAgICAgIHRleHQgPSAnRW5hYmxlIE1pY3JvcGhvbmUnO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWNvbkVsID0gJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgbGVmdFwiPicgKyBpY29uICsgJzwvaT4nO1xuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5odG1sKGljb25FbCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTtcblxuICB9KTtcblxuICBidG5IYW5nb3V0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc29sZS5sb2coJ2hhbmdvdXQnKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFVzZXJNZWRpYShjb25zdHJhaW50cykge1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVkaWFTdHJlYW0pIHtcbiAgICAgICAgcmVzb2x2ZShtZWRpYVN0cmVhbSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICB9KTtcbn1cblxuSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmIChIYW5kbGViYXJzLnRlbXBsYXRlcyA9PT0gdW5kZWZpbmVkIHx8IEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIEhhbmRsZWJhcnMudGVtcGxhdGVzID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUoSGFuZGxlYmFycy50ZW1wbGF0ZXNbbmFtZV0pO1xuICAgIH1cblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IG5hbWUgKyAnLmhicycsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpO1xuICAgICAgICByZXNvbHZlKEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdKTtcbiAgICAgIH0sXG5cbiAgICAgIGZhaWw6IGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59O1xuIl19
