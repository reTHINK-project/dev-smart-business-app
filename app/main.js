let domain = 'localhost';
let currentUser = null;
let userStatus = null;

// let chat = null;
let userDirectory = [
    ['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'],
    ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'],
    ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']
];

const userStatusHyperty = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/UserStatusHyperty`;

// const chatHyperty = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/HypertyChat`;

rethink.default.install({
  domain: domain,
  development: true
}).then((runtime) => {
    runtime.requireHyperty(userStatusHyperty(domain)).then((result) => {
        userStatus = result.instance;
        console.log('start smart business app', result.name, result);
        init();

        // runtime.requireHyperty(chatHyperty(domain)).then((result) => {
        //   chat = result.instance;
        // });
      }).catch(function() {
      console.error('cant load UserStatus hyperty');
    });
  });

function init() {
  $('#app').removeClass('hide');
  $('#loading').addClass('hide');

  // bind statusChange event for presence update
  userStatus.addEventListener('statusChange', function(event) {
    console.log('handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status);
    if (currentUser === null) {
      currentUser = email;
      $('#currentUser').html(currentUser);
      $('#user-list').children('[rel="' + email + '"]').remove();
    }
  });

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then((template) => {
    let participants = [];
    $.each(userDirectory, function(i, v) {
      $('#user-list').append(template({email: v[0], username: v[1]}));
      participants.push({email: v[0], domain: v[2]});
    });
    $('#user-status-toggler').find('a').on('click', function(e) {
      e.preventDefault();
      userStatus.setStatus($(this).attr('rel'));
    });

    $('#user-list').on('click', 'a:not(.state-disconnected)', function(e) {
      e.preventDefault();
      console.log('seach user info');
      showUserDetail($(this).attr('rel'));
    });

    userStatus.create(participants).then(function(res) {
      console.log('invite for user presence ok', res);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

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
  let userPrefix = email.split('@')[0];
  if ($('#tab-manager').children('li[rel="' + email + '"]').length === 0) {
    $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
    $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
    userStatus._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then((data) => {
      console.log('show user detail for', data);
      Handlebars.getTemplate('tpl/user-details').then((template) => {
        $('#' + userPrefix).append(template({email: email, username: getUserNicknameByEmail(email), hypertyURL: data.hypertyURL}));
        $('#tab-manager').tabs('select_tab', userPrefix);
      });
    });
  }
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
