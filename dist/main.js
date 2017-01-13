'use strict';

var userStatusHyperty = null;
var chatHyperty = null;
var connectorHyperty = null;
var config = require('../config.json');
var rethink = require('./factories/rethink');
var domain = config.domain;

var userDirectory = [['openidtest10@gmail.com', 'TestOpenID 10', 'localhost'], ['jtestapizee@gmail.com', 'jtestapizee', 'localhost'], ['anajb006@gmail.com', 'anajb006', 'localhost'], ['openidtest20@gmail.com', 'TestOpenID 20', 'localhost']];

var defaultAvatar = 'img/photo.jpg';

// const hypertyURI = (domain, hyperty) => `hyperty-catalogue://${domain}/.well-known/hyperty/${hyperty}`;
var hypertyURI = function hypertyURI(domain, hyperty) {
  return 'hyperty-catalogue://catalogue.' + domain + '/.well-known/hyperty/' + hyperty;
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
    domain: config.domain, //or domain
    runtimeURL: config.runtimeURL,
    development: true
  }).then(function (runtime) {
    console.log('############################### runtime', runtime);
    console.log('############################### Trying loading hyperty', hypertyURI(domain, 'UserStatus'));
    runtime.requireHyperty(hypertyURI(domain, 'UserStatus')).then(function (hyperty) {
      userStatusHyperty = hyperty.instance;
      console.log('############################### OKKK', userStatusHyperty);
      console.log('############################### loading hyperty', hypertyURI(domain, 'GroupChat'));
      return runtime.requireHyperty(hypertyURI(domain, 'GroupChat')).then(function (hyperty) {
        chatHyperty = hyperty.instance;
        console.log('############################### OKKK', chatHyperty);
        console.log('############################### loading hyperty', hypertyURI(domain, 'Connector'));
        return runtime.requireHyperty(hypertyURI(domain, 'Connector')).then(function (hyperty) {
          connectorHyperty = hyperty.instance;
          console.log('############################### OKKK', connectorHyperty);
          init();
        });
      });
    });
  }).catch(function (reason) {
    console.error(reason);
  });
}

function init() {
  console.log('############################### start smart business app');

  // bind chat creation
  chatHyperty.onInvite(function (chatGroup) {
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
    connectorHyperty.onInvitation(function (controller, identity) {
      console.log('On Invitation: ', controller, identity);
      notificationHandler(controller, identity);
    });
    // connectorHyperty.onInvitation('connector:connected', function(controller) {
    //   console.log('############################### connector:connected', controller);
    //   connectorHyperty.onInvitation('have:notification', function(event) {
    //     console.log('############################### have:notification', event);
    //     notificationHandler(controller, event);
    //   });
    // });
  }

  // start chat
  $('#main').on('click', '.startChat', function () {
    var email = $(this).closest('.user-detail').attr('rel');
    console.log('############################### start chat with', email);
    chatHyperty.create(email, [{ email: email, domain: 'localhost' }]).then(function (chatGroup) {
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
    userStatusHyperty._discovery.discoverHypertyPerUser(email, 'localhost').then(function (result) {
      var userPrefix = email.split('@')[0];
      Handlebars.getTemplate('tpl/video-section').then(function (html) {
        console.log('############################### openVideo', result);
        $('#' + userPrefix).find('.video-section').append(html);
        console.debug('############################### video', $('#' + userPrefix).find('.video-section').append(html));
        console.debug('############################### result.hypertyURL', result.hypertyURL);
        openVideo(result.hypertyURL);
      });
    });
  });

  // user directory click
  $('#user-list').on('click', '.collection-item', function (e) {
    // console.debug('user-list,event is :', e);
    // console.debug('this is : ',   $('#user-list').children('rel'));
    // var listItem = $( 'a' ).first();
    // console.debug('listItem  is : ',   listItem);
    // console.debug('email  is : ',   $("#4928").attr('rel'));


    e.preventDefault();

    // let email = $(this).attr('rel');
    var email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });

  // user status change
  $('#user-status-toggler').find('a').on('click', function (e) {
    e.preventDefault();
    console.debug('this is : ', this);
    console.debug('event is :', e);
    console.debug('$(this).attr(rel):', $(this).attr('rel'));
    userStatusHyperty.setStatus($(this).attr('rel'));
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
    console.debug('############################### invite for user presence participants:', participants);
    userStatusHyperty.create(participants).then(function (res) {
      console.debug('############################### invite for user presence ok', res);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });
  });

  // bind statusChange event for presence update
  userStatusHyperty.addEventListener('statusChange', function (event) {
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
  $('#tab-manager').find('li[rel="' + email + '"]').trigger('click');
  console.debug('active tab is', $('#tab-manager').find('li[rel="' + email + '"]').trigger('click'));
  return new Promise(function (resolve, reject) {
    var userPrefix = email.split('@')[0];
    if ($('#' + userPrefix).length === 0) {
      console.log('############################### add tab for user', email);
      $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
      $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
      return userStatusHyperty._discovery.discoverHypertyPerUser(email, domain).then(function (DiscStatusHyperty) {
        var statusHyperty = DiscStatusHyperty.hypertyURL;
        console.log('############################### Discovered statusHyperty', statusHyperty);
        // return chatHyperty._getHyFor(email, domain).then((DiscChatHyperty) => {
        //   let DiscChat = DiscChatHyperty.hypertyURL;
        // console.log('############################### Discovered ChatHyperty', DiscChat);
        console.log('############################### loading hyperty', hypertyURI(domain, 'Connector'));
        return connectorHyperty.discovery.discoverHypertyPerUser(email, domain).then(function (discoveredRTCHyperty) {
          var WebRTCHypertyURL = discoveredRTCHyperty.hypertyURL;
          console.debug('############################### Discovered WebRTCHypertyURL', WebRTCHypertyURL);
          Handlebars.getTemplate('tpl/user-details').then(function (template) {
            $('#' + userPrefix).append(template({
              UserId: DiscStatusHyperty.id,
              DescriptorURL: DiscStatusHyperty.descriptor,
              email: email,
              username: getUserNicknameByEmail(email),
              PeerstatusURL: statusHyperty,
              // PeerChatURL: DiscChat,
              PeerWebRTCURL: WebRTCHypertyURL,
              avatar: defaultAvatar
            }));
            $('#tab-manager').tabs('select_tab', userPrefix);
            resolve();
          });
        }).catch(function (reason) {
          reject(reason);
        });

        // });
      });

      //  userStatusHyperty._discovery.discoverHypertyPerUser(email, domain).then((data) => {
      //   console.log('############################### show user detail for: ', data);
      //   Handlebars.getTemplate('tpl/user-details').then((template) => {
      //     $('#' + userPrefix).append(template({
      //       UserId: data.id,
      //       DescriptorURL:data.descriptor,
      //       email: email,
      //       username: getUserNicknameByEmail(email),
      //       HypertyURL: data.hypertyURL,
      //       avatar: defaultAvatar
      //     }));
      //     $('#tab-manager').tabs('select_tab', userPrefix);
      //     resolve();
      //   });
      // }).catch((reason) => {
      //   reject(reason);
      // });
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
    return connectorHyperty.connect(hypertyURL, mediaStream, 'roomID', domain);
  }).then(function (controller) {
    console.log('############################### showVideo: ', controller);
    showVideo(controller);
    processLocalVideo(localMediaStream);

    // controller.addEventListener('on:notification', notification);
    // controller.addEventListener('on:subscribe', function(controller) {
    //   console.info('on:subscribe:event ', controller);
    // });

    // controller.addEventListener('connector:notification', notification);

    // controller.addEventListener('stream:added', processVideo);
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

function processLocalVideo(mediaStream) {
  console.log('Process Local Video: ', mediaStream);

  var videoHolder = $('.video-holder');
  var video = videoHolder.find('.my-video');
  video[0].src = URL.createObjectURL(mediaStream);
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