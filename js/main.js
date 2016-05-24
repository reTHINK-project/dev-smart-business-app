(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var domain = 'localhost';
var currentUser = null;
var userStatus = null;

var chat = null;
var userDirectory = [['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'], ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'], ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']];

var userStatusHyperty = function userStatusHyperty(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/UserStatusHyperty';
};

var chatHyperty = function chatHyperty(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/HypertyChat';
};

rethink.default.install({
  domain: domain,
  development: true
}).then(function (runtime) {
  runtime.requireHyperty(userStatusHyperty(domain)).then(function (result) {
    userStatus = result.instance;
    console.log('start smart business app', result.name, result);
    init();

    runtime.requireHyperty(chatHyperty(domain)).then(function (result) {
      chat = result.instance;
    });
  }).catch(function () {
    console.error('cant load UserStatus hyperty');
  });
});

function init() {
  $('#app').removeClass('hide');
  $('#loading').addClass('hide');

  // bind statusChange event for presence update
  userStatus.addEventListener('statusChange', function (event) {
    console.log('handle statusChange event for', event);
    var email = typeof event !== 'undefined' && typeof event.identity !== 'undefined' ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status.status);
    if (currentUser === null) {
      currentUser = email;
      $('#currentUser').html(currentUser);
      $('#user-list').children('[rel="' + email + '"]').remove();
    }
  });

  // fetch user-card template
  Handlebars.getTemplate('tpl/user-card').then(function (template) {
    var participants = [];
    $.each(userDirectory, function (i, v) {
      $('#user-list').append(template({ email: v[0], username: v[1] }));
      participants.push({ email: v[0], domain: v[2] });
    });
    $('#user-status-toggler').find('a').on('click', function (e) {
      e.preventDefault();
      userStatus.setStatus($(this).attr('rel'));
    });

    $('#user-list').on('click', 'a:not(.state-disconnected)', function (e) {
      e.preventDefault();
      console.log('seach user info');
      showUserDetail($(this).attr('rel'));
    });

    userStatus.create(participants).then(function (res) {
      console.log('invite for user presence ok', res);
    }).catch(function (reason) {
      console.error(reason);
    });
  });
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
  var userPrefix = email.split('@')[0];
  if ($('#tab-manager').children('li[rel="' + email + '"]').length === 0) {
    $('#tab-manager').append('<li class="tab col s3" rel="' + email + '"><a href="#' + userPrefix + '">' + userPrefix + '</a></li>');
    $('#main').append('<div id="' + userPrefix + '" class="col s12"></div>');
    userStatus._hypertyDiscovery.discoverHypertyPerUser(email, 'localhost').then(function (data) {
      console.log('show user detail for', data);
      Handlebars.getTemplate('tpl/user-details').then(function (template) {
        $('#' + userPrefix).append(template({ email: email, username: getUserNicknameByEmail(email), hypertyURL: data.hypertyURL }));
        $('#tab-manager').tabs('select_tab', userPrefix);
      });
    });
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLGNBQWMsSUFBbEI7QUFDQSxJQUFJLGFBQWEsSUFBakI7O0FBRUEsSUFBSSxPQUFPLElBQVg7QUFDQSxJQUFJLGdCQUFnQixDQUNoQixDQUFDLHdCQUFELEVBQTJCLGlCQUEzQixFQUE4QyxXQUE5QyxDQURnQixFQUVoQixDQUFDLHdCQUFELEVBQTJCLGlCQUEzQixFQUE4QyxXQUE5QyxDQUZnQixFQUdoQixDQUFDLDBCQUFELEVBQTZCLGFBQTdCLEVBQTRDLFdBQTVDLENBSGdCLENBQXBCOztBQU1BLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFDLE1BQUQ7QUFBQSxrQ0FBbUMsTUFBbkM7QUFBQSxDQUExQjs7QUFFQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsTUFBRDtBQUFBLGtDQUFtQyxNQUFuQztBQUFBLENBQXBCOztBQUVBLFFBQVEsT0FBUixDQUFnQixPQUFoQixDQUF3QjtBQUN0QixVQUFRLE1BRGM7QUFFdEIsZUFBYTtBQUZTLENBQXhCLEVBR0csSUFISCxDQUdRLFVBQUMsT0FBRCxFQUFhO0FBQ2pCLFVBQVEsY0FBUixDQUF1QixrQkFBa0IsTUFBbEIsQ0FBdkIsRUFBa0QsSUFBbEQsQ0FBdUQsVUFBQyxNQUFELEVBQVk7QUFDL0QsaUJBQWEsT0FBTyxRQUFwQjtBQUNBLFlBQVEsR0FBUixDQUFZLDBCQUFaLEVBQXdDLE9BQU8sSUFBL0MsRUFBcUQsTUFBckQ7QUFDQTs7QUFFQSxZQUFRLGNBQVIsQ0FBdUIsWUFBWSxNQUFaLENBQXZCLEVBQTRDLElBQTVDLENBQWlELFVBQUMsTUFBRCxFQUFZO0FBQzNELGFBQU8sT0FBTyxRQUFkO0FBQ0QsS0FGRDtBQUdELEdBUkgsRUFRSyxLQVJMLENBUVcsWUFBVztBQUNwQixZQUFRLEtBQVIs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QUFFRCxNQUFFLElBQUYsQ0FBTztBQUNMLFdBQUssT0FBTyxNQURQO0FBRUwsZUFBUyxpQkFBUyxJQUFULEVBQWU7QUFDdEIsbUJBQVcsU0FBWCxDQUFxQixJQUFyQixJQUE2QixXQUFXLE9BQVgsQ0FBbUIsSUFBbkIsQ0FBN0I7QUFDQSxnQkFBUSxXQUFXLFNBQVgsQ0FBcUIsSUFBckIsQ0FBUjtBQUNELE9BTEk7O0FBT0wsWUFBTSxjQUFTLE1BQVQsRUFBaUI7QUFDckIsZUFBTyxNQUFQO0FBQ0Q7QUFUSSxLQUFQO0FBV0QsR0FsQk0sQ0FBUDtBQW1CRCxDQXBCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZG9tYWluID0gJ2xvY2FsaG9zdCc7XG5sZXQgY3VycmVudFVzZXIgPSBudWxsO1xubGV0IHVzZXJTdGF0dXMgPSBudWxsO1xuXG5sZXQgY2hhdCA9IG51bGw7XG5sZXQgdXNlckRpcmVjdG9yeSA9IFtcbiAgICBbJ29wZW5pZHRlc3QxMEBnbWFpbC5jb20nLCAnVGVzdCBPcGVuIElEIDEwJywgJ2xvY2FsaG9zdCddLFxuICAgIFsnb3BlbmlkdGVzdDIwQGdtYWlsLmNvbScsICdUZXN0IE9wZW4gSUQgMjAnLCAnbG9jYWxob3N0J10sXG4gICAgWydvcGVuaWQxLmFwaXplZUBnbWFpbC5jb20nLCAnVGVzdCBBcGl6ZWUnLCAnbG9jYWxob3N0J11cbl07XG5cbmNvbnN0IHVzZXJTdGF0dXNIeXBlcnR5ID0gKGRvbWFpbikgPT4gYGh5cGVydHktY2F0YWxvZ3VlOi8vJHtkb21haW59Ly53ZWxsLWtub3duL2h5cGVydHkvVXNlclN0YXR1c0h5cGVydHlgO1xuXG5jb25zdCBjaGF0SHlwZXJ0eSA9IChkb21haW4pID0+IGBoeXBlcnR5LWNhdGFsb2d1ZTovLyR7ZG9tYWlufS8ud2VsbC1rbm93bi9oeXBlcnR5L0h5cGVydHlDaGF0YDtcblxucmV0aGluay5kZWZhdWx0Lmluc3RhbGwoe1xuICBkb21haW46IGRvbWFpbixcbiAgZGV2ZWxvcG1lbnQ6IHRydWVcbn0pLnRoZW4oKHJ1bnRpbWUpID0+IHtcbiAgICBydW50aW1lLnJlcXVpcmVIeXBlcnR5KHVzZXJTdGF0dXNIeXBlcnR5KGRvbWFpbikpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICB1c2VyU3RhdHVzID0gcmVzdWx0Lmluc3RhbmNlO1xuICAgICAgICBjb25zb2xlLmxvZygnc3RhcnQgc21hcnQgYnVzaW5lc3MgYXBwJywgcmVzdWx0Lm5hbWUsIHJlc3VsdCk7XG4gICAgICAgIGluaXQoKTtcblxuICAgICAgICBydW50aW1lLnJlcXVpcmVIeXBlcnR5KGNoYXRIeXBlcnR5KGRvbWFpbikpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGNoYXQgPSByZXN1bHQuaW5zdGFuY2U7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdjYW50IGxvYWQgVXNlclN0YXR1cyBoeXBlcnR5Jyk7XG4gICAgfSk7XG4gIH0pO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAkKCcjYXBwJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgJCgnI2xvYWRpbmcnKS5hZGRDbGFzcygnaGlkZScpO1xuXG4gIC8vIGJpbmQgc3RhdHVzQ2hhbmdlIGV2ZW50IGZvciBwcmVzZW5jZSB1cGRhdGVcbiAgdXNlclN0YXR1cy5hZGRFdmVudExpc3RlbmVyKCdzdGF0dXNDaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdoYW5kbGUgc3RhdHVzQ2hhbmdlIGV2ZW50IGZvcicsIGV2ZW50KTtcbiAgICBsZXQgZW1haWwgPSAodHlwZW9mIGV2ZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXZlbnQuaWRlbnRpdHkgIT09ICd1bmRlZmluZWQnKSA/IGV2ZW50LmlkZW50aXR5LmVtYWlsIDogJ25vbmUnO1xuICAgICQoJyN1c2VyLWxpc3QnKS5jaGlsZHJlbignW3JlbD1cIicgKyBlbWFpbCArICdcIl0nKS5yZW1vdmVDbGFzcygnc3RhdGUtZGlzY29ubmVjdGVkIHN0YXRlLWNvbm5lY3RlZCBzdGF0ZS1idXN5JykuYWRkQ2xhc3MoJ3N0YXRlLScgKyBldmVudC5zdGF0dXMuc3RhdHVzKTtcbiAgICBpZiAoY3VycmVudFVzZXIgPT09IG51bGwpIHtcbiAgICAgIGN1cnJlbnRVc2VyID0gZW1haWw7XG4gICAgICAkKCcjY3VycmVudFVzZXInKS5odG1sKGN1cnJlbnRVc2VyKTtcbiAgICAgICQoJyN1c2VyLWxpc3QnKS5jaGlsZHJlbignW3JlbD1cIicgKyBlbWFpbCArICdcIl0nKS5yZW1vdmUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGZldGNoIHVzZXItY2FyZCB0ZW1wbGF0ZVxuICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdXNlci1jYXJkJykudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICBsZXQgcGFydGljaXBhbnRzID0gW107XG4gICAgJC5lYWNoKHVzZXJEaXJlY3RvcnksIGZ1bmN0aW9uKGksIHYpIHtcbiAgICAgICQoJyN1c2VyLWxpc3QnKS5hcHBlbmQodGVtcGxhdGUoe2VtYWlsOiB2WzBdLCB1c2VybmFtZTogdlsxXX0pKTtcbiAgICAgIHBhcnRpY2lwYW50cy5wdXNoKHtlbWFpbDogdlswXSwgZG9tYWluOiB2WzJdfSk7XG4gICAgfSk7XG4gICAgJCgnI3VzZXItc3RhdHVzLXRvZ2dsZXInKS5maW5kKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdXNlclN0YXR1cy5zZXRTdGF0dXMoJCh0aGlzKS5hdHRyKCdyZWwnKSk7XG4gICAgfSk7XG5cbiAgICAkKCcjdXNlci1saXN0Jykub24oJ2NsaWNrJywgJ2E6bm90KC5zdGF0ZS1kaXNjb25uZWN0ZWQpJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5sb2coJ3NlYWNoIHVzZXIgaW5mbycpO1xuICAgICAgc2hvd1VzZXJEZXRhaWwoJCh0aGlzKS5hdHRyKCdyZWwnKSk7XG4gICAgfSk7XG5cbiAgICB1c2VyU3RhdHVzLmNyZWF0ZShwYXJ0aWNpcGFudHMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBjb25zb2xlLmxvZygnaW52aXRlIGZvciB1c2VyIHByZXNlbmNlIG9rJywgcmVzKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICB9KTtcbiAgfSk7XG5cbn1cblxuLyoqXG4gKiBSZXR1cm4gbmlja25hbWUgY29ycmVzcG9uZGluZyB0byBlbWFpbFxuICovXG5mdW5jdGlvbiBnZXRVc2VyTmlja25hbWVCeUVtYWlsKGVtYWlsKSB7XG4gIGxldCByZXMgPSAnJztcbiAgJC5lYWNoKHVzZXJEaXJlY3RvcnksIChpLCB2KSA9PiB7XG4gICAgaWYgKHZbMF0gPT09IGVtYWlsKSB7XG4gICAgICByZXMgPSB2WzFdO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogRmV0Y2ggdXNlciBpbmZvcyBieSBlbWFpbCAmIGRpc3BsYXkgdXNlciBkZXRhaWwgb24gbWFpbiBjb250ZW50XG4gKi9cbmZ1bmN0aW9uIHNob3dVc2VyRGV0YWlsKGVtYWlsKSB7XG4gIGxldCB1c2VyUHJlZml4ID0gZW1haWwuc3BsaXQoJ0AnKVswXTtcbiAgaWYgKCQoJyN0YWItbWFuYWdlcicpLmNoaWxkcmVuKCdsaVtyZWw9XCInICsgZW1haWwgKyAnXCJdJykubGVuZ3RoID09PSAwKSB7XG4gICAgJCgnI3RhYi1tYW5hZ2VyJykuYXBwZW5kKCc8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCIgcmVsPVwiJyArIGVtYWlsICsgJ1wiPjxhIGhyZWY9XCIjJyArIHVzZXJQcmVmaXggKyAnXCI+JyArIHVzZXJQcmVmaXggKyAnPC9hPjwvbGk+Jyk7XG4gICAgJCgnI21haW4nKS5hcHBlbmQoJzxkaXYgaWQ9XCInICsgdXNlclByZWZpeCArICdcIiBjbGFzcz1cImNvbCBzMTJcIj48L2Rpdj4nKTtcbiAgICB1c2VyU3RhdHVzLl9oeXBlcnR5RGlzY292ZXJ5LmRpc2NvdmVySHlwZXJ0eVBlclVzZXIoZW1haWwsICdsb2NhbGhvc3QnKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnc2hvdyB1c2VyIGRldGFpbCBmb3InLCBkYXRhKTtcbiAgICAgIEhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUoJ3RwbC91c2VyLWRldGFpbHMnKS50aGVuKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICAkKCcjJyArIHVzZXJQcmVmaXgpLmFwcGVuZCh0ZW1wbGF0ZSh7ZW1haWw6IGVtYWlsLCB1c2VybmFtZTogZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCksIGh5cGVydHlVUkw6IGRhdGEuaHlwZXJ0eVVSTH0pKTtcbiAgICAgICAgJCgnI3RhYi1tYW5hZ2VyJykudGFicygnc2VsZWN0X3RhYicsIHVzZXJQcmVmaXgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmIChIYW5kbGViYXJzLnRlbXBsYXRlcyA9PT0gdW5kZWZpbmVkIHx8IEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIEhhbmRsZWJhcnMudGVtcGxhdGVzID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUoSGFuZGxlYmFycy50ZW1wbGF0ZXNbbmFtZV0pO1xuICAgIH1cblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IG5hbWUgKyAnLmhicycsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpO1xuICAgICAgICByZXNvbHZlKEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdKTtcbiAgICAgIH0sXG5cbiAgICAgIGZhaWw6IGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59O1xuIl19
