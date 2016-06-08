let domain = 'localhost';
let userStatusHyperty = null;
let chatHyperty = null;
let connectorHyperty = null;

let userDirectory = [
    ['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'],
    ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'],
    ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']
];

let defaultAvatar = 'img/photo.jpg';

const hypertyURI = (domain, hyperty) => `hyperty-catalogue://${domain}/.well-known/hyperty/${hyperty}`;

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
$(function() {
  if (typeof localStorage.username !== 'undefined') {
    console.log('############################### already logged with...', localStorage.username);
    startApp();
  }
  $('#account-example > li').on('click', function() {
    $('#email').val($(this).children('.account-mail').text()).focus();
    $('#pass').val($(this).children('.account-pwd').text()).focus();
  });
  $('#login').on('submit', function(e) {
    e.preventDefault();
    console.log('############################### authenticate through service with...', $('#email').val());
    if ($('#email,#pass')[0].checkValidity()) {
      localStorage.setItem('username', $('#email').val());
      startApp();
    } else {
      console.log('############################### form is not valid...');
    }
  });

  $('#logout').on('click', function(e) {
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
  }).then((runtime) => {
    console.log('############################### runtime', runtime);
    console.log('############################### loading hyperty', hypertyURI(domain, 'UserStatus'));
    runtime.requireHyperty(hypertyURI(domain, 'UserStatus')).then((hyperty) => {
      userStatusHyperty = hyperty;
      console.log('###############################', userStatusHyperty);
      console.log('############################### loading hyperty', hypertyURI(domain, 'GroupChat'));
      return runtime.requireHyperty(hypertyURI(domain, 'GroupChat')).then((hyperty) => {
        chatHyperty = hyperty;
        console.log('###############################', chatHyperty);
        console.log('############################### loading hyperty', hypertyURI(domain, 'HypertyConnector'));
        return runtime.requireHyperty(hypertyURI(domain, 'HypertyConnector')).then((hyperty) => {
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
  userStatusHyperty.instance.addEventListener('statusChange', (event) => {
    console.log('############################### handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status);
    let items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'disconnected') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });

  // bind chat creation
  chatHyperty.instance.onInvite(function(chatGroup) {
    console.log('############################### detect invite for chat', chatGroup);
    chatGroup.onMessage(function(message) {
      console.log('############################### new message received: ', message);
      let email = message._dataObjectChild.identity.email;
      showUserDetail(email).then(() => {
        return prepareChat(chatGroup, email);
      }).then(() => {
        processMessage(email, message);
      }).catch(function(reason) {
        console.error('###############################', reason);
      });
    });
  });

  if (connectorHyperty !== null) {
    connectorHyperty.instance.addEventListener('connector:connected', function(controller) {
      console.log('############################### connector:connected', controller);
      connectorHyperty.instance.addEventListener('have:notification', function(event) {
        console.log('############################### have:notification', event);
        notificationHandler(controller, event);
      });
    });
  }

  // start chat
  $('#main').on('click', '.startChat', function() {
    let email = $(this).closest('.user-detail').attr('rel');
    console.log('############################### start chat with', email);
    chatHyperty.instance.create(email, [{email: email, domain: 'localhost'}]).then((chatGroup) => {
      prepareChat(chatGroup, email).then((chatGroup) => {
        console.log('############################### bind event onMessage');
        chatGroup.onMessage((message) => {
          console.log('############################### on startbtn event promise', chatGroup);
          processMessage(email, message);
        });
      });
    });
  });

  // start call
  $('#main').on('click', '.startCall', function() {
    let email = $(this).closest('.user-detail').attr('rel');
    $(this).remove();
    console.log('############################### start call with', email);
    userStatusHyperty.instance._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then((result) => {
      let userPrefix = email.split('@')[0];
      Handlebars.getTemplate('tpl/video-section').then((html) => {
        console.log('############################### openVideo', result);
        $('#' + userPrefix).find('.video-section').append(html);
        openVideo(result.hypertyURL);
      });
    });
  });

  // user directory click
  $('#user-list').on('click', 'a:not(.state-disconnected)', function(e) {
    e.preventDefault();
    let email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });

  // user status change
  $('#user-status-toggler').find('a').on('click', function(e) {
    e.preventDefault();
    userStatusHyperty.instance.setStatus($(this).attr('rel'));
  });

  updateRelativeTime();
  setInterval(() => {
    updateRelativeTime();
  }, 60000);

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then((template) => {
    let participants = [];
    $.each(userDirectory, function(i, v) {
      if (v[0] !== localStorage.username) {
        $('#user-list').append(template({email: v[0], username: v[1]}));
        participants.push({email: v[0], domain: v[2]});
      }
    });
    console.log('############################### invite for user presence ok', participants);
    userStatusHyperty.instance.create(participants).then(function(res) {
      console.log('############################### invite for user presence ok', res);
    }).catch(function(reason) {
      console.error('###############################', reason);
    });
  });
}

function updateRelativeTime() {
  $('.time-relative').each(function() {
    let msg = $(this);
    let timeObj = moment.unix(msg.attr('ts'));
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
  let msg = (typeof message.text !== 'undefined') ? message.text.replace(/\n/g, '<br>') : message;
  let chatSection = $('#' + email.split('@')[0]).find('.chat-section');
  let messagesList = chatSection.find('.messages .collection'); //getUserNicknameByEmail(remoteUser)
  let ts = Math.round((new Date()).getTime() / 1000, 10);
  $('#' + email.split('@')[0]).find('.startChat').remove();
  let list = `<li class="collection-item avatar ` + (message.isMe ? 'local' : 'remote') + `">
    <span class="time-relative right" ts="` + ts + `">` + moment.unix(ts).fromNow() + `</span>
    <span class="title left">` + getUserNicknameByEmail(email) + `</span>
    <img src="` + defaultAvatar + `" alt="" class="circle">
    <p class="left">` + msg + `</p>
    </li>`;
  messagesList.append(list);
  messagesList.scrollTop(messagesList[0].scrollHeight);
}

/**
 * Return nickname corresponding to email
 */
function getUserNicknameByEmail(email) {
  let res = '';
  $.each(userDirectory, (i, v) => {
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
  return new Promise((resolve, reject) => {
    let userPrefix = email.split('@')[0];
    if ($('#' + userPrefix).length === 0) {
      console.log('############################### add tab for user', email);
      $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
      $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
      return userStatusHyperty.instance._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then((data) => {
        console.log('############################### show user detail for', data);
        Handlebars.getTemplate('tpl/user-details').then((template) => {
          $('#' + userPrefix).append(template({
            email: email,
            username: getUserNicknameByEmail(email),
            avatar: defaultAvatar
          }));
          $('#tab-manager').tabs('select_tab', userPrefix);
          resolve();
        });
      }).catch((reason) => {
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
  return new Promise((resolve, reject) => {
    let userPrefix = email.split('@')[0];
    if ($('#' + userPrefix).find('.message-form').length > 0) {
      console.log('############################### container chat already exist for', email);
      resolve(chatGroup);
    } else {
      console.log('############################### add container chat for', email);
      Handlebars.getTemplate('tpl/chat-section').then((html) => {
        let containerEl = $('#' + userPrefix).find('.chat-section');
        containerEl.removeClass('hide').append(html);

        let messageForm = containerEl.find('.message-form');
        let textArea = messageForm.find('.materialize-textarea');

        textArea.on('keyup', (e) => {
          if (e.keyCode === 13 && !e.shiftKey) {
            messageForm.submit();
          }
        });

        messageForm.on('submit', (e) => {
          e.preventDefault();

          let message = messageForm.find('[name="message"]').val();
          chatGroup.sendMessage(message).then(function(result) {
            console.log('############################### message sent', result);
            messageForm.get(0).reset();
            processMessage(email, result);
          }).catch(function(reason) {
            console.error('###############################', reason);
          });
        });
        resolve(chatGroup);
      }).catch(() => {
        reject();
      });
    }
  });
}

/****************************************** Call ******************************************/
function openVideo(hypertyURL) {

  var options = options || {video: true, audio: true};
  getUserMedia(options).then(function(mediaStream) {
    console.log('############################### received media stream: ', mediaStream);
    return connectorHyperty.instance.connect(hypertyURL, mediaStream);
  })
  .then(function(controller) {
    console.log('############################### showVideo: ', controller);
    showVideo(controller);

    controller.addEventListener('on:notification', notification);
    controller.addEventListener('on:subscribe', function(controller) {
      console.info('on:subscribe:event ', controller);
    });

    controller.addEventListener('connector:notification', notification);

    controller.addEventListener('stream:added', processVideo);

  }).catch(function(reason) {
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

  acceptBtn.on('click', function(e) {

    e.preventDefault();

    var options = options || {video: true, audio: true};
    getUserMedia(options).then(function(mediaStream) {
      console.info('recived media stream: ', mediaStream);
      return controller.accept(mediaStream);
    })
    .then(function(result) {
      console.log(result);
    }).catch(function(reason) {
      console.error('###############################', reason);
    });

  });

  rejectBtn.on('click', function(e) {

    controller.decline().then(function(result) {
      console.log(result);
    }).catch(function(reason) {
      console.error('###############################', reason);
    });

    e.preventDefault();
  });

  var parseInformation = '<div class="col s12">' +
        '<div class="row valign-wrapper">' +
          '<div class="col s2">' +
            '<img src="' + calleeInfo.infoToken.picture + '" alt="" class="circle responsive-img">' +
          '</div>' +
          '<span class="col s10">' +
            '<div class="row">' +
              '<span class="col s3 text-right">Name: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.infoToken.name + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">Email: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.infoToken.email + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">locale: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.infoToken.locale + '</span>' +
            '</span>' +
          '</div>' +
        '</div>';

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

  btnCamera.on('click', function(event) {

    event.preventDefault();

    controller.disableCam().then(function(status) {
      console.log(status, 'camera');
      var icon = 'videocam_off';
      var text = 'Disable Camera';
      if (!status) {
        text = 'Enable Camera';
        icon = 'videocam';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(reason) {
      console.error('###############################', reason);
    });

  });

  btnMute.on('click', function(event) {

    event.preventDefault();

    controller.mute().then(function(status) {
      console.log(status, 'audio');
      var icon = 'volume_off';
      var text = 'Disable Sound';
      if (!status) {
        text = 'Enable Sound';
        icon = 'volume_up';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(e) {
      console.error(e);
    });

    console.log('mute other peer');

  });

  btnMic.on('click', function(event) {

    event.preventDefault();

    controller.disableMic().then(function(status) {
      console.log(status, 'mic');
      var icon = 'mic_off';
      var text = 'Disable Microphone';
      if (!status) {
        icon = 'mic';
        text = 'Enable Microphone';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(e) {
      console.error(e);
    });

  });

  btnHangout.on('click', function(event) {

    event.preventDefault();

    console.log('hangout');
  });
}

function getUserMedia(constraints) {

  return new Promise(function(resolve, reject) {

    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(mediaStream) {
        resolve(mediaStream);
      })
      .catch(function(reason) {
        reject(reason);
      });
  });
}

Handlebars.getTemplate = function(name) {
  return new Promise(function(resolve, reject) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: name + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },

      fail: function(reason) {
        reject(reason);
      }
    });
  });
};
