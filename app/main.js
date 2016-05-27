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

const userStatusHypertyURI = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/UserStatusHyperty`;
const chatHypertyURI = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/GroupChat`;
const connectorHypertyURI = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/HypertyConnector`;

console.log('############################### loading runtime');
rethink.default.install({
  domain: domain,
  development: true
}).then((runtime) => {
  console.log('############################### loading user status hyperty', runtime);
  runtime.requireHyperty(userStatusHypertyURI(domain)).then((hyperty) => {
    userStatusHyperty = hyperty;
    console.log('###############################', userStatusHyperty);
    return runtime.requireHyperty(chatHypertyURI(domain)).then((hyperty) => {
      chatHyperty = hyperty;
      console.log('###############################', chatHyperty);
      return runtime.requireHyperty(connectorHypertyURI(domain)).then((hyperty) => {
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
      });
    });
  });

  // start chat
  $('#main').on('click', '.startChat', function() {
    let email = $(this).closest('.user-detail').attr('rel');
    $(this).closest('.row').remove();
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

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then((template) => {
    let participants = [];
    $.each(userDirectory, function(i, v) {
      $('#user-list').append(template({email: v[0], username: v[1]}));
      participants.push({email: v[0], domain: v[2]});
    });

    userStatusHyperty.instance.create(participants).then(function(res) {
      console.log('############################### invite for user presence ok', res);
    }).catch(function(reason) {
      console.error(reason);
    });
  });
}

function processMessage(email, message) {
  console.info('############################### new message received: ', message);
  let msg = (typeof message.text !== 'undefined') ? message.text.replace(/\n/g, '<br>') : message;
  let chatSection = $('#' + email.split('@')[0]).find('.chat-section');
  let messagesList = chatSection.find('.messages .collection'); //getUserNicknameByEmail(remoteUser)
  let list = `<li class="collection-item avatar ` + (message.isMe ? 'local' : 'remote') + `">
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
            console.error('message error', reason);
          });
        });
        resolve(chatGroup);
      }).catch(() => {
        reject();
      });
    }
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
