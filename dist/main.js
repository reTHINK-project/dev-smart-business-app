'use strict';

var _utils = require('./utils');

var userStatusHyperty = null;
var groupChatHyperty = null;
var stHyperty = void 0;
var loading = false;
var chHyperty = void 0;
var userName = void 0;
var userURL = void 0;
var avatar = {};
var callHyperty = void 0;
var RTCHyperty = void 0;
var DiscChat = [];
var statusHyperty = [];
var WebRTCHyperty = [];
var connectorHyperty = null;
var config = require('../config.json');
var rethink = require('./factories/rethink');
var domain = config.domain;
var btnCall = void 0;

var userDirectory = [['openidtest10@gmail.com', 'TestOpenID 10', 'localhost'], ['jtestapizee@gmail.com', 'TestApizee', 'localhost'], ['openidtest20@gmail.com', 'TestOpenID 20', 'localhost']];

var visitorDirectory = [['anajb006@gmail.com', 'PersoanlGmail', 'localhost']];

var defaultAvatar = 'img/photo.jpg';

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
  // visitor mode
  $('#contactUS').on('submit', function (e) {
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

      console.log('############################### loading hyperty', hypertyURI(domain, 'Connector'));
      return runtime.requireHyperty(hypertyURI(domain, 'Connector')).then(function (hyperty) {
        callHyperty = hyperty;
        console.log('############################### OKKK :', callHyperty);

        console.log('############################### loading hyperty', hypertyURI(domain, 'GroupChat'));
        return runtime.requireHyperty(hypertyURI(domain, 'GroupChatManager')).then(function (hyperty) {
          groupChatHyperty = hyperty.instance;
          console.log('############################### OKKK', groupChatHyperty);
          getMyHypertyInfo(hyperty);
          init();
        });
      });
    });
  }).catch(function (reason) {
    console.error(reason);
  });
  (0, _utils.serialize)();
}

function init() {
  console.log('############################### start smart business app');
  groupChatHyperty.onInvitation(function (event) {
    console.debug('############################### detect invite for chat event', event);
    onInvitation(event);
  });

  userStatusHyperty.onInvitation(function (event) {
    console.debug('############################### detect userStatusHyperty for event', event);
    onStatusInvitation(event);
  });

  if (callHyperty.instance !== null) {
    callHyperty.instance.onInvitation(function (controller, identity) {
      console.log('On Invitation callHyperty: ', controller, identity);
      WebRTCnotificationHandler(controller, identity);
    });
  } else {
    var msg = 'If you need pass the hyperty to your template, create a function called hypertyLoaded';
    console.info(msg);
    notification(msg, 'warn');
  }

  // start chat
  $('#main').on('click', '.startChat', function () {
    var email = $(this).closest('.user-detail').attr('rel');
    var $mainContent = $('.main-content').find('.row');
    console.debug('############################### start chat with', email);
    Handlebars.getTemplate('tpl/ChatManager').then(function (template) {
      var html = template();
      $mainContent.html(html);
      if (typeof hypertyLoaded === 'function') {
        hypertyLoaded(groupChatHyperty);
      } else {
        var _msg = 'If you need pass the hyperty to your template, create a function called hypertyLoaded';
        console.info(_msg);
        notification(_msg, 'warn');
      }

      loading = false;
    });
  });

  // start call
  $('#main').on('click', '.startCall', function (event) {
    var email = $(this).closest('.user-detail').attr('rel');
    var userPrefix = email.split('@')[0];
    var $mainContent = $('.main-content').find('.row');
    btnCall = $(this);
    $(this).hide();
    console.debug('############################### start call with', email);
    // Handlebars.getTemplate('tpl/video-section').then(function(template) {
    // let html = template();
    // $mainContent.html(html);
    // $('#' + userPrefix).find('.video-section').append(html);
    event.preventDefault();
    console.debug('event is :', event);
    var userURLtest = $(event.currentTarget).parent().attr('data-user');
    console.debug('userURL is : ', userURLtest);
    var hypertyURL = $(event.currentTarget).parent().attr('data-url');
    // let roomID = document.getElementById('roomName').value;
    var roomID = 'Test';

    // let domain = hypertyURL.substring(hypertyURL.lastIndexOf(':') + 3, hypertyURL.lastIndexOf('/'));
    console.debug('Domain:', domain);
    openVideo(userURL, roomID, domain);

    // });  
  });

  // user directory click
  $('#user-list').on('click', '.collection-item', function (e) {
    e.preventDefault();

    var email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });
  // agnets  directory click
  $('#agents-list').on('click', '.collection-item', function (e) {
    e.preventDefault();

    var email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });
  // visitors lists
  $('#visitor-list').on('click', '.collection-item', function (e) {
    e.preventDefault();

    var email = $(this).attr('rel');
    console.log('############################### seach user info for', email);
    showUserDetail(email);
  });
  // visitor status
  // user status change
  $('#visitor-status-toggler').find('a').on('click', function (e) {
    e.preventDefault();
    console.debug('this is : ', this);
    console.debug('event is :', e);
    console.debug('$(this).attr(rel):', $(this).attr('rel'));
    userStatusHyperty.setStatus($(this).attr('rel'));
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
  // setInterval(() => {
  //   updateRelativeTime();
  // }, 60000);

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then(function (template) {
    var participants = [];
    $.each(userDirectory, function (i, v) {
      if (v[0] !== localStorage.username) {
        $('#user-list').append(template({ email: v[0], username: v[1] }));
        participants.push({ email: v[0], domain: v[2] });
      }
    });
    $.each(visitorDirectory, function (i, v) {
      // if (v[0] !== localStorage.username) {
      console.debug('v[0]:', v);
      $('#visitor-list').append(template({ email: v[0], username: v[1] }));
      participants.push({ email: v[0], domain: v[2] });
      // }
    });
    console.debug('############################### invite for user presence participants:', participants);
    userStatusHyperty.create(participants).then(function (res) {
      console.debug('############################### invite for user presence ok', res);
    }).catch(function (reason) {
      console.error('###############################', reason);
    });
  });

  // fetch agents-card template
  Handlebars.getTemplate('tpl/user-card').then(function (template) {
    var participants = [];
    $.each(userDirectory, function (i, v) {
      if (v[0] !== localStorage.username) {
        $('#agents-list').append(template({ email: v[0], username: v[1] }));
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
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.userProfile.username : 'none';

    $('#visitor-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
    var messagesList = $('#visitor-list').find('[rel="' + email + '"]');

    var from = '';

    avatar[event.identity.userProfile.username] = event.identity.userProfile.avatar;

    // let list = `<li class="collection-item avatar">
    //   <img src="` + avatar + `" alt="" class="circle"></li>`;
    // messagesList.append(list);
    // $('#user-list').addClass(event.identity.userProfile.avatar);
    var items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'unavailable' || event.status === 'away') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });
  // bind statusChange event for presence update
  userStatusHyperty.addEventListener('statusChange', function (event) {
    console.log('############################### handle statusChange event for', event);
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.userProfile.username : 'none';

    $('#agents-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
    var messagesList = $('#agents-list').find('[rel="' + email + '"]');

    var from = '';

    avatar[event.identity.userProfile.username] = event.identity.userProfile.avatar;
    var items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'unavailable' || event.status === 'away') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });

  // bind statusChange event for presence update
  userStatusHyperty.addEventListener('statusChange', function (event) {
    console.log('############################### handle statusChange event for', event);
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.userProfile.username : 'none';

    $('#visitor-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
    var messagesList = $('#visitor-list').find('[rel="' + email + '"]');

    var from = '';

    avatar[event.identity.userProfile.username] = event.identity.userProfile.avatar;

    var items = $('#' + email.split('@')[0]).add($('#tab-manager').find('[rel="' + email + '"]'));
    if (event.status === 'unavailable' || event.status === 'away') {
      items.addClass('disable');
    } else {
      items.removeClass('disable');
    }
  });
}

/*************************************************** reTHINK WebRTC Call **********************************************************/

function WebRTCnotificationHandler(controller, identity) {
  // Handlebars.getTemplate('tpl/video-section').then(function(template) {
  //       let html = template();
  //       $mainContent.html(html);
  //       $('#' + userPrefix).find('.video-section').append(html);
  //         event.preventDefault();
  //       }); 

  var calleeInfo = identity;
  var incoming = $('.modal-call');
  var acceptBtn = incoming.find('.btn-accept');
  var rejectBtn = incoming.find('.btn-reject');
  var informationHolder = incoming.find('.information');
  console.debug('informationHolder is :', informationHolder);

  showVideo(controller);

  acceptBtn.on('click', function (e) {

    console.log('accepted call from', calleeInfo);

    e.preventDefault();
    var options = options || { video: true, audio: true };
    getUserMedia(options).then(function (mediaStream) {
      console.debug('--------------------- getUserMedia 259------------------------------');
      processLocalVideo(mediaStream);
      return controller.accept(mediaStream);
    }).then(function (result) {
      console.log(result);
    }).catch(function (reason) {
      console.error(reason);
    });
  });

  rejectBtn.on('click', function (e) {

    controller.decline().then(function (result) {
      console.log(result);
    }).catch(function (reason) {
      console.error(reason);
    });

    e.preventDefault();
  });

  var parseInformation = '<div class="col s12">' + '<div class="row valign-wrapper">' + '<div class="col s2">' + '<img src="' + calleeInfo.avatar + '" alt="" class="circle responsive-img">' + '</div>' + '<span class="col s10">' + '<div class="row">' + '<span class="col s3 text-right">Name: </span>' + '<span class="col s9 black-text">' + calleeInfo.cn + '</span>' + '</span>' + '<span class="row">' + '<span class="col s3 text-right">Email: </span>' + '<span class="col s9 black-text">' + calleeInfo.username + '</span>' + '</span>' + '<span class="row">' + '<span class="col s3 text-right">Locale: </span>' + '<span class="col s9 black-text">' + calleeInfo.locale + '</span>' + '</span>' + '<span class="row">' + '<span class="col s3 text-right">UserURL: </span>' + '<span class="col s9 black-text">' + calleeInfo.userURL + '</span>' + '</span>' + '</div>' + '</div>';

  informationHolder.html(parseInformation);
  $('.modal-call').openModal();
}

function emailDiscoveredError(result) {

  console.error('Email Discovered Error: ', result);

  var section = $('.discover');
  var collection = section.find('.collection');

  var collectionItem = '<li class="collection-item orange lighten-3"><i class="material-icons left circle">error_outline</i>' + result + '</li>';

  collection.empty();
  collection.removeClass('center-align');
  collection.removeClass('hide');
  collection.append(collectionItem);
}

function openVideo(hyperty, roomID, domain) {

  console.log('connecting to hyperty: ', hyperty);

  var toHyperty = hyperty;
  var localMediaStream;

  var options = options || { video: true, audio: true };
  getUserMedia(options).then(function (mediaStream) {
    console.info('recived media stream: ', mediaStream);
    localMediaStream = mediaStream;
    return callHyperty.instance.connect(toHyperty, mediaStream, roomID, domain);
  }).then(function (controller) {
    showVideo(controller);

    processLocalVideo(localMediaStream);
  }).catch(function (reason) {
    console.error(reason);
  });
}

function processVideo(event) {

  console.log('Process Video: ', event);

  var videoHolder = $('.video-holder');
  var video = videoHolder.find('.video');
  console.debug('video[0], video : ', video[0], video);
  video[0].src = URL.createObjectURL(event.stream);
}

function processLocalVideo(mediaStream) {
  console.log('Process Local Video: ', mediaStream);

  var videoHolder = $('.video-holder');
  var video = videoHolder.find('.my-video');
  video[0].src = URL.createObjectURL(mediaStream);
  console.debug('video[0], video :', video[0], video);
}

function disconnecting() {

  var videoHolder = $('.video-holder');
  var myVideo = videoHolder.find('.my-video');
  var video = videoHolder.find('.video');
  myVideo[0].src = '';
  video[0].src = '';

  videoHolder.addClass('hide');
}

function showVideo(controller) {

  var videoHolder = $('.video-holder');
  videoHolder.removeClass('hide');

  var btnCamera = videoHolder.find('.camera');
  var btnMute = videoHolder.find('.mute');
  var btnMic = videoHolder.find('.mic');
  var btnHangout = videoHolder.find('.hangout');

  console.debug(controller);

  controller.onAddStream(function (event) {
    processVideo(event);
  });

  controller.onDisconnect(function (identity) {
    disconnecting();
  });

  btnCamera.on('click', function (event) {

    event.preventDefault();

    controller.disableVideo().then(function (status) {
      console.log(status, 'camera');
      var icon = 'videocam_off';
      var text = 'Disable Camera';
      if (!status) {
        text = 'Enable Camera';
        icon = 'videocam';
      }

      var iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function (e) {
      console.error(e);
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

    controller.disableAudio().then(function (status) {
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

    controller.disconnect().then(function (status) {
      console.log('Status of Handout:', status);
      disconnecting();
      btnCall.show();
    }).catch(function (e) {
      console.error(e);
    });

    console.log('hangout');
  });
}

/***********************************************************************************************************************************/

/********************************************************** chat ********************************************************************/

function notification(msg, type) {

  var $el = $('.main-content .notification');
  var color = type === 'error' ? 'red' : 'black';

  removeLoader($el);
  $el.append('<span class="' + color + '-text">' + msg + '</span>');
}

function hypertyLoaded(result) {

  // Prepare to discover email:
  var search = result.search;

  search.myIdentity().then(function (identity) {
    chatHypertyReady(result, identity);
  });
}

function getMyHypertyInfo(result) {

  var search = result.instance.search;
  console.debug('search is : ', search);
  userName = result.name;

  search.myIdentity().then(function (identity) {
    console.debug('myIdentity is : ', identity);
    var $cardPanel = $('.card-panel');
    var hypertyInfo = '<div class="row"><span class="white-text">' + '<b>Name:</b> ' + result.name + '</br>' + '<b>Status:</b> ' + result.status + '</br>' + '<b>groupChatHypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' + '<b>WebRTCHypertyURL:</b> ' + callHyperty.runtimeHypertyURL + '</br>' + '</span></div>';

    var userInfo = '<div class="row"><span class="white-text">' + '<span class="col s2">' + '<img width="48" height="48" src="' + identity.avatar + '" alt="" class="circle">' + '</span><span class="col s10">' + '<b>Name:</b> ' + identity.cn + '</br>' + '<b>Email:</b> ' + identity.username + '</br>' + '<b>UserURL:</b> ' + identity.userURL + '</span></div>';

    $cardPanel.append(userInfo);
    $cardPanel.append(hypertyInfo);
  });
}

function chatHypertyReady(result, identity) {

  // groupChatHyperty.onInvitation((event) => {
  //   onInvitation(event);
  // });

  var messageChat = $('.chat');
  messageChat.removeClass('hide');

  var chatSection = $('.chat-section');
  chatSection.removeClass('hide');

  var createBtn = $('.create-room-btn');
  var joinBtn = $('.join-room-btn');

  createBtn.on('click', createRoom);
  joinBtn.on('click', joinRoom);
}

function createRoom(event) {
  console.debug('here createRoom : event is:', event);
  event.preventDefault();

  var createRoomModal = $('.create-chat');
  var createRoomBtn = createRoomModal.find('.btn-create');
  var addParticipantBtn = createRoomModal.find('.btn-add');

  addParticipantBtn.on('click', addParticipantEvent);
  createRoomBtn.on('click', createRoomEvent);
  createRoomModal.openModal();
}

function addParticipantEvent(event) {

  event.preventDefault();

  var createRoomModal = $('.create-chat');
  var participants = createRoomModal.find('.participants-form');
  var countParticipants = participants.length - 1;

  countParticipants++;

  var participantEl = '<div class="row">' + '<div class="input-field col s8">' + '  <input class="input-email" name="email" id="email-' + countParticipants + '" required aria-required="true" type="text">' + '  <label for="email-' + countParticipants + '">Participant Email</label>' + '</div>' + '<div class="input-field col s4">' + '  <input class="input-domain" name="domain" id="domain-' + countParticipants + '" type="text">' + '  <label for="domain-' + countParticipants + '">Participant domain</label>' + '</div>' + '</div>';

  participants.append(participantEl);
}

function onInvitation(event) {
  console.debug('############################################ On Invitation: ', event);

  groupChatHyperty.join(event.url).then(function (chatController) {
    prepareChat(chatController);

    setTimeout(function () {
      var users = event.value.participants;

      users.forEach(function (user) {
        processNewUser(user);
      });
    }, 500);
  }).catch(function (reason) {
    console.error('Error connectin to', reason);
  });
}

function createRoomEvent(event) {
  event.preventDefault();

  var createRoomModal = $('.create-chat');
  var participantsForm = createRoomModal.find('.participants-form');
  var serializedObject = $(participantsForm).serializeArray();
  var users = [];
  var domains = [];

  if (serializedObject) {
    var emailsObject = serializedObject.filter(function (field) {
      return field.name === 'email';
    });
    users = emailsObject.map(function (emailObject) {
      return emailObject.value;
    });
    var domainObject = serializedObject.filter(function (field) {
      return field.name === 'domain';
    });
    domains = domainObject.map(function (domainObject) {
      return domainObject.value;
    });
  }

  // Prepare the chat
  var name = createRoomModal.find('.input-name').val();

  console.debug('Participants: ', users, ' domain: ', domains);

  groupChatHyperty.create(name, users, domains).then(function (chatController) {

    var isOwner = true;
    prepareChat(chatController, isOwner);
    participantsForm[0].reset();
  }).catch(function (reason) {
    console.error(reason);
  });
}

function joinRoom(event) {
  event.preventDefault();

  var joinModal = $('.join-chat');
  var joinBtn = joinModal.find('.btn-join');

  joinBtn.on('click', function (event) {

    event.preventDefault();

    var resource = joinModal.find('.input-name').val();

    groupChatHyperty.join(resource).then(function (chatController) {
      console.debug('done ?');
      prepareChat(chatController);
    }).catch(function (reason) {
      console.error(reason);
    });
  });

  joinModal.openModal();
}

function prepareChat(chatController, isOwner) {
  console.debug('noo ?');

  console.debug('Chat Group Controller: ', chatController);

  chatController.onMessage(function (message) {
    console.debug('new message recived: ', message);
    processMessage(message);
  });

  chatController.onChange(function (event) {
    console.debug('App - OnChange Event:', event);
  });

  chatController.onUserAdded(function (event) {
    console.debug('App - onUserAdded Event:', event);
    processNewUser(event);
  });

  chatController.onUserRemoved(function (event) {
    console.debug('App - onUserRemoved Event:', event);
  });

  chatController.onClose(function (event) {
    console.debug('App - onClose Event:', event);

    $('.chat-section').remove();
  });

  Handlebars.getTemplate('tpl/chat-section').then(function (html) {

    $('.chat-section').append(html);

    chatManagerReady(chatController, isOwner);

    var inviteBtn = $('.invite-btn');
    inviteBtn.on('click', function (event) {

      event.preventDefault();

      inviteParticipants(chatController);
    });
  });
}

function inviteParticipants(chatController) {

  var inviteModal = $('.invite-chat');
  var inviteBtn = inviteModal.find('.btn-modal-invite');

  inviteBtn.on('click', function (event) {

    event.preventDefault();

    var usersIDs = inviteModal.find('.input-emails').val();
    var domains = inviteModal.find('.input-domains').val();

    var usersIDsParsed = [];
    if (usersIDs.includes(',')) {
      usersIDsParsed = usersIDs.split(', ');
    } else {
      usersIDsParsed.push(usersIDs);
    }

    var domainsParsed = [];
    if (domains.includes(',')) {
      domainsParsed = domains.split(', ');
    } else {
      domainsParsed.push(domains);
    }

    chatController.addUser(usersIDsParsed, domainsParsed).then(function (result) {
      console.debug('Invite emails', result);
    }).catch(function (reason) {
      console.log('Error:', reason);
    });
  });

  inviteModal.openModal();
}

function chatManagerReady(chatController, isOwner) {

  var chatSection = $('.chat-section');
  var addParticipantModal = $('.add-participant');
  var btnAdd = addParticipantModal.find('.btn-add');
  var btnCancel = addParticipantModal.find('.btn-cancel');

  var messageForm = chatSection.find('.message-form');
  var textArea = messageForm.find('.materialize-textarea');

  Handlebars.getTemplate('tpl/chat-header').then(function (template) {
    var name = chatController.dataObject.data.name;
    var resource = chatController.dataObject._url;
    console.debug('name && resource :', name, resource);

    var html = template({ name: name, resource: resource });
    $('.chat-header').append(html);

    if (isOwner) {

      var closeBtn = $('.close-btn');
      closeBtn.removeClass('hide');
      closeBtn.on('click', function (event) {

        event.preventDefault();

        closeChat(chatController);
      });
    }
  });

  textArea.on('keyup', function (event) {

    if (event.keyCode === 13 && !event.shiftKey) {
      messageForm.submit();
    }
  });

  messageForm.on('submit', function (event) {

    event.preventDefault();

    var object = $(this).serializeObject();
    var message = object.message;

    chatController.send(message).then(function (result) {
      console.log('message sent', result);
      processMessage(result);
      messageForm[0].reset();
    }).catch(function (reason) {
      console.error('message error', reason);
    });
  });

  btnAdd.on('click', function (event) {
    event.preventDefault();

    var emailValue = addParticipantModal.find('.input-name').val();
    chatController.addParticipant(emailValue).then(function (result) {
      console.log('hyperty', result);
    }).catch(function (reason) {
      console.error(reason);
    });
  });

  btnCancel.on('click', function (event) {
    event.preventDefault();
  });
}

function processMessage(message) {

  var chatSection = $('.chat-section');
  var messagesList = chatSection.find('.messages .collection');
  var avatar = '';
  var from = '';

  if (message.identity) {
    avatar = message.identity.userProfile.avatar;
    from = message.identity.userProfile.cn;
  }

  var list = '<li class="collection-item avatar">\n    <img src="' + avatar + '" alt="" class="circle">\n    <span class="title">' + from + '</span>\n    <p>' + message.value.message.replace(/\n/g, '<br>') + '</p>\n  </li>';

  messagesList.append(list);
}

function processNewUser(event) {

  console.log('ADD PARTICIPANT: ', event);

  var section = $('.conversations');
  var collection = section.find('.participant-list');

  if (event.hasOwnProperty('data') && event.data) {

    var users = event.data;

    users.map(function (user) {
      collection.append('<li class="chip" data-name="' + user.userURL + '"><img src="' + user.avatar + '" alt="Contact Person">' + user.cn + '<i class="material-icons close">close</i></li>');
    });
  } else {
    var user = event;
    console.log('Add User:', user);
    collection.append('<li class="chip" data-name="' + user.userURL + '"><img src="' + user.avatar + '" alt="Contact Person">' + user.cn + '<i class="material-icons close">close</i></li>');
  }

  collection.removeClass('center-align');

  var closeBtn = collection.find('.close');
  closeBtn.on('click', function (e) {
    e.preventDefault();

    var item = $(e.currentTarget).parent().attr('data-name');
    removeParticipant(item);
  });
}

function removeParticipant(item) {
  var section = $('.conversations');
  var collection = section.find('.participant-list');
  var element = collection.find('li[data-name="' + item + '"]');
  element.remove();
}

function closeChat(chatController) {

  chatController.close().then(function (result) {
    console.log('Chat closed: ', result);

    var createRoomModal = $('.create-chat');
    var createRoomBtn = createRoomModal.find('.btn-create');
    var addParticipantBtn = createRoomModal.find('.btn-add');

    addParticipantBtn.off('click', addParticipantEvent);
    createRoomBtn.off('click', createRoomEvent);

    $('.chat-section').remove();
  }).catch(function (reason) {
    console.log('An error occured:', reason);
  });
}

function onStatusInvitation(event) {
  console.debug('On status Invitation: ', event);

  userStatusHyperty.join(event.url).then(function (status) {
    console.debug('status is: ', status);
  }).catch(function (reason) {
    console.error('Error getting status to', reason);
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

/**************************************************************************************************************** */

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
  customDiscovery(email);
}

function customDiscovery(email) {

  return new Promise(function (resolve, reject) {
    var userPrefix = email.split('@')[0];
    var userAvatar = '';
    if ($('#' + userPrefix).length === 0) {
      console.log('############################### add tab for user', email);
      $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
      $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
      return userStatusHyperty.discovery.discoverHypertiesPerUser(email, domain).then(function (discoveredHyperties) {
        console.debug('discoveredHyperties[Object.keys(discoveredHyperties)] is :', discoveredHyperties);

        var size = Object.keys(discoveredHyperties).length;

        console.debug('############################### Discovered descriptor ', discoveredHyperties[Object.keys(discoveredHyperties)[0]]);
        for (var i = 0; i < size; i++) {
          console.debug(discoveredHyperties[Object.keys(discoveredHyperties)[i]]);
          if (discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.substr(discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.lastIndexOf('/') + 1) === "UserStatus") {
            statusHyperty.push(discoveredHyperties[Object.keys(discoveredHyperties)[i]]);
            console.debug('statusHyperty:', statusHyperty);
          } else if (discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.substr(discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.lastIndexOf('/') + 1) === "GroupChatManager") {
            DiscChat.push(discoveredHyperties[Object.keys(discoveredHyperties)[i]]);
            console.debug('chatHyperty:', DiscChat);
          } else if (discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.substr(discoveredHyperties[Object.keys(discoveredHyperties)[i]].descriptor.lastIndexOf('/') + 1) === "Connector") {
            WebRTCHyperty.push(discoveredHyperties[Object.keys(discoveredHyperties)[i]]);
            console.debug('WebRTCHyperty :', WebRTCHyperty);
          }
        }
        stHyperty = getLatestHypertyPerUser(statusHyperty);
        chHyperty = getLatestHypertyPerUser(DiscChat);
        RTCHyperty = getLatestHypertyPerUser(WebRTCHyperty);
        console.debug('statusHyperty:', stHyperty);
        console.debug('chHyperty:', chHyperty);
        console.debug('RTCHyperty :', RTCHyperty);
        userURL = stHyperty.userID;
        console.debug('user avatar is :', avatar, email);
        if (avatar[email] == email) {
          console.debug('user avatar is :', avatar[email]);
        }

        Handlebars.getTemplate('tpl/user-details').then(function (template) {
          $('#' + userPrefix).append(template({
            UserId: stHyperty.userID,
            DescriptorURL: stHyperty.descriptor,
            email: email,
            username: getUserNicknameByEmail(email),
            PeerstatusURL: stHyperty.hypertyID,
            PeerChatURL: chHyperty.hypertyID,
            PeerWebRTCURL: RTCHyperty.hypertyID,
            avatar: avatar[email]
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

function getLatestHypertyPerUser(hypertyObj) {

  var hyperty = void 0;
  var mostRecent = void 0;
  var lastHyperty = void 0;

  new Promise(function (resolve, reject) {

    for (var i = 0; i < hypertyObj.length; i++) {

      if (hypertyObj[i].lastModified !== undefined) {
        if (mostRecent === undefined) {
          mostRecent = new Date(hypertyObj[i].lastModified);
          lastHyperty = hypertyObj[i];
        } else {
          var hypertyDate = new Date(hypertyObj[i].lastModified);
          if (mostRecent.getTime() < hypertyDate.getTime()) {
            mostRecent = hypertyDate;
            lastHyperty = hypertyObj[i];
          }
        }
      }
    }

    console.log('Last Hyperty: ', lastHyperty, mostRecent);
    resolve(lastHyperty);
  }).catch(function (reason) {
    console.error('Error Happened while geting Lateast Hyperty per user reason:', reason);
    reject();
  });
  return lastHyperty;
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