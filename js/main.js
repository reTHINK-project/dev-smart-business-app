(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var domain = 'localhost';
var currentUser = null;
var userStatus = null;

// let chat = null;
var userDirectory = [['openidtest10@gmail.com', 'Test Open ID 10', 'localhost'], ['openidtest20@gmail.com', 'Test Open ID 20', 'localhost'], ['openid1.apizee@gmail.com', 'Test Apizee', 'localhost']];

var userStatusHyperty = function userStatusHyperty(domain) {
  return 'hyperty-catalogue://' + domain + '/.well-known/hyperty/UserStatusHyperty';
};

// const chatHyperty = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/HypertyChat`;

rethink.default.install({
  domain: domain,
  development: true
}).then(function (runtime) {
  runtime.requireHyperty(userStatusHyperty(domain)).then(function (result) {
    userStatus = result.instance;
    console.log('start smart business app', result.name, result);
    init();

    // runtime.requireHyperty(chatHyperty(domain)).then((result) => {
    //   chat = result.instance;
    // });
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
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxTQUFTLFdBQWI7QUFDQSxJQUFJLGNBQWMsSUFBbEI7QUFDQSxJQUFJLGFBQWEsSUFBakI7OztBQUdBLElBQUksZ0JBQWdCLENBQ2hCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRGdCLEVBRWhCLENBQUMsd0JBQUQsRUFBMkIsaUJBQTNCLEVBQThDLFdBQTlDLENBRmdCLEVBR2hCLENBQUMsMEJBQUQsRUFBNkIsYUFBN0IsRUFBNEMsV0FBNUMsQ0FIZ0IsQ0FBcEI7O0FBTUEsSUFBTSxvQkFBb0IsU0FBcEIsaUJBQW9CLENBQUMsTUFBRDtBQUFBLGtDQUFtQyxNQUFuQztBQUFBLENBQTFCOzs7O0FBSUEsUUFBUSxPQUFSLENBQWdCLE9BQWhCLENBQXdCO0FBQ3RCLFVBQVEsTUFEYztBQUV0QixlQUFhO0FBRlMsQ0FBeEIsRUFHRyxJQUhILENBR1EsVUFBQyxPQUFELEVBQWE7QUFDakIsVUFBUSxjQUFSLENBQXVCLGtCQUFrQixNQUFsQixDQUF2QixFQUFrRCxJQUFsRCxDQUF1RCxVQUFDLE1BQUQsRUFBWTtBQUMvRCxpQkFBYSxPQUFPLFFBQXBCO0FBQ0EsWUFBUSxHQUFSLENBQVksMEJBQVosRUFBd0MsT0FBTyxJQUEvQyxFQUFxRCxNQUFyRDtBQUNBOzs7OztBQUtELEdBUkgsRUFRSyxLQVJMLENBUVcsWUFBVztBQUNwQixZQUFRLEtBQVIsQ0FBYyw4QkFBZDtBQUNELEdBVkQ7QUFXRCxDQWZIOztBQWlCQSxTQUFTLElBQVQsR0FBZ0I7QUFDZCxJQUFFLE1BQUYsRUFBVSxXQUFWLENBQXNCLE1BQXRCO0FBQ0EsSUFBRSxVQUFGLEVBQWMsUUFBZCxDQUF1QixNQUF2Qjs7O0FBR0EsYUFBVyxnQkFBWCxDQUE0QixjQUE1QixFQUE0QyxVQUFTLEtBQVQsRUFBZ0I7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QVMsTUFBVCxFQUFpQjtBQUNyQixlQUFPLE1BQVA7QUFDRDtBQVRJLEtBQVA7QUFXRCxHQWxCTSxDQUFQO0FBbUJELENBcEJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImxldCBkb21haW4gPSAnbG9jYWxob3N0JztcbmxldCBjdXJyZW50VXNlciA9IG51bGw7XG5sZXQgdXNlclN0YXR1cyA9IG51bGw7XG5cbi8vIGxldCBjaGF0ID0gbnVsbDtcbmxldCB1c2VyRGlyZWN0b3J5ID0gW1xuICAgIFsnb3BlbmlkdGVzdDEwQGdtYWlsLmNvbScsICdUZXN0IE9wZW4gSUQgMTAnLCAnbG9jYWxob3N0J10sXG4gICAgWydvcGVuaWR0ZXN0MjBAZ21haWwuY29tJywgJ1Rlc3QgT3BlbiBJRCAyMCcsICdsb2NhbGhvc3QnXSxcbiAgICBbJ29wZW5pZDEuYXBpemVlQGdtYWlsLmNvbScsICdUZXN0IEFwaXplZScsICdsb2NhbGhvc3QnXVxuXTtcblxuY29uc3QgdXNlclN0YXR1c0h5cGVydHkgPSAoZG9tYWluKSA9PiBgaHlwZXJ0eS1jYXRhbG9ndWU6Ly8ke2RvbWFpbn0vLndlbGwta25vd24vaHlwZXJ0eS9Vc2VyU3RhdHVzSHlwZXJ0eWA7XG5cbi8vIGNvbnN0IGNoYXRIeXBlcnR5ID0gKGRvbWFpbikgPT4gYGh5cGVydHktY2F0YWxvZ3VlOi8vJHtkb21haW59Ly53ZWxsLWtub3duL2h5cGVydHkvSHlwZXJ0eUNoYXRgO1xuXG5yZXRoaW5rLmRlZmF1bHQuaW5zdGFsbCh7XG4gIGRvbWFpbjogZG9tYWluLFxuICBkZXZlbG9wbWVudDogdHJ1ZVxufSkudGhlbigocnVudGltZSkgPT4ge1xuICAgIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkodXNlclN0YXR1c0h5cGVydHkoZG9tYWluKSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIHVzZXJTdGF0dXMgPSByZXN1bHQuaW5zdGFuY2U7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdGFydCBzbWFydCBidXNpbmVzcyBhcHAnLCByZXN1bHQubmFtZSwgcmVzdWx0KTtcbiAgICAgICAgaW5pdCgpO1xuXG4gICAgICAgIC8vIHJ1bnRpbWUucmVxdWlyZUh5cGVydHkoY2hhdEh5cGVydHkoZG9tYWluKSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIC8vICAgY2hhdCA9IHJlc3VsdC5pbnN0YW5jZTtcbiAgICAgICAgLy8gfSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2NhbnQgbG9hZCBVc2VyU3RhdHVzIGh5cGVydHknKTtcbiAgICB9KTtcbiAgfSk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICQoJyNhcHAnKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAkKCcjbG9hZGluZycpLmFkZENsYXNzKCdoaWRlJyk7XG5cbiAgLy8gYmluZCBzdGF0dXNDaGFuZ2UgZXZlbnQgZm9yIHByZXNlbmNlIHVwZGF0ZVxuICB1c2VyU3RhdHVzLmFkZEV2ZW50TGlzdGVuZXIoJ3N0YXR1c0NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2hhbmRsZSBzdGF0dXNDaGFuZ2UgZXZlbnQgZm9yJywgZXZlbnQpO1xuICAgIGxldCBlbWFpbCA9ICh0eXBlb2YgZXZlbnQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBldmVudC5pZGVudGl0eSAhPT0gJ3VuZGVmaW5lZCcpID8gZXZlbnQuaWRlbnRpdHkuZW1haWwgOiAnbm9uZSc7XG4gICAgJCgnI3VzZXItbGlzdCcpLmNoaWxkcmVuKCdbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpLnJlbW92ZUNsYXNzKCdzdGF0ZS1kaXNjb25uZWN0ZWQgc3RhdGUtY29ubmVjdGVkIHN0YXRlLWJ1c3knKS5hZGRDbGFzcygnc3RhdGUtJyArIGV2ZW50LnN0YXR1cyk7XG4gICAgaWYgKGN1cnJlbnRVc2VyID09PSBudWxsKSB7XG4gICAgICBjdXJyZW50VXNlciA9IGVtYWlsO1xuICAgICAgJCgnI2N1cnJlbnRVc2VyJykuaHRtbChjdXJyZW50VXNlcik7XG4gICAgICAkKCcjdXNlci1saXN0JykuY2hpbGRyZW4oJ1tyZWw9XCInICsgZW1haWwgKyAnXCJdJykucmVtb3ZlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBmZXRjaCB1c2VyLWNhcmQgdGVtcGxhdGVcbiAgSGFuZGxlYmFycy5nZXRUZW1wbGF0ZSgndHBsL3VzZXItY2FyZCcpLnRoZW4oKHRlbXBsYXRlKSA9PiB7XG4gICAgbGV0IHBhcnRpY2lwYW50cyA9IFtdO1xuICAgICQuZWFjaCh1c2VyRGlyZWN0b3J5LCBmdW5jdGlvbihpLCB2KSB7XG4gICAgICAkKCcjdXNlci1saXN0JykuYXBwZW5kKHRlbXBsYXRlKHtlbWFpbDogdlswXSwgdXNlcm5hbWU6IHZbMV19KSk7XG4gICAgICBwYXJ0aWNpcGFudHMucHVzaCh7ZW1haWw6IHZbMF0sIGRvbWFpbjogdlsyXX0pO1xuICAgIH0pO1xuICAgICQoJyN1c2VyLXN0YXR1cy10b2dnbGVyJykuZmluZCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHVzZXJTdGF0dXMuc2V0U3RhdHVzKCQodGhpcykuYXR0cigncmVsJykpO1xuICAgIH0pO1xuXG4gICAgJCgnI3VzZXItbGlzdCcpLm9uKCdjbGljaycsICdhOm5vdCguc3RhdGUtZGlzY29ubmVjdGVkKScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdzZWFjaCB1c2VyIGluZm8nKTtcbiAgICAgIHNob3dVc2VyRGV0YWlsKCQodGhpcykuYXR0cigncmVsJykpO1xuICAgIH0pO1xuXG4gICAgdXNlclN0YXR1cy5jcmVhdGUocGFydGljaXBhbnRzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgY29uc29sZS5sb2coJ2ludml0ZSBmb3IgdXNlciBwcmVzZW5jZSBvaycsIHJlcyk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgfSk7XG4gIH0pO1xuXG59XG5cbi8qKlxuICogUmV0dXJuIG5pY2tuYW1lIGNvcnJlc3BvbmRpbmcgdG8gZW1haWxcbiAqL1xuZnVuY3Rpb24gZ2V0VXNlck5pY2tuYW1lQnlFbWFpbChlbWFpbCkge1xuICBsZXQgcmVzID0gJyc7XG4gICQuZWFjaCh1c2VyRGlyZWN0b3J5LCAoaSwgdikgPT4ge1xuICAgIGlmICh2WzBdID09PSBlbWFpbCkge1xuICAgICAgcmVzID0gdlsxXTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEZldGNoIHVzZXIgaW5mb3MgYnkgZW1haWwgJiBkaXNwbGF5IHVzZXIgZGV0YWlsIG9uIG1haW4gY29udGVudFxuICovXG5mdW5jdGlvbiBzaG93VXNlckRldGFpbChlbWFpbCkge1xuICBsZXQgdXNlclByZWZpeCA9IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gIGlmICgkKCcjdGFiLW1hbmFnZXInKS5jaGlsZHJlbignbGlbcmVsPVwiJyArIGVtYWlsICsgJ1wiXScpLmxlbmd0aCA9PT0gMCkge1xuICAgICQoJyN0YWItbWFuYWdlcicpLmFwcGVuZCgnPGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiIHJlbD1cIicgKyBlbWFpbCArICdcIj48YSBocmVmPVwiIycgKyB1c2VyUHJlZml4ICsgJ1wiPicgKyB1c2VyUHJlZml4ICsgJzwvYT48L2xpPicpO1xuICAgICQoJyNtYWluJykuYXBwZW5kKCc8ZGl2IGlkPVwiJyArIHVzZXJQcmVmaXggKyAnXCIgY2xhc3M9XCJjb2wgczEyXCI+PC9kaXY+Jyk7XG4gICAgdXNlclN0YXR1cy5faHlwZXJ0eURpc2NvdmVyeS5kaXNjb3Zlckh5cGVydHlQZXJVc2VyKGVtYWlsLCAnbG9jYWxob3N0JykudGhlbigoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3Nob3cgdXNlciBkZXRhaWwgZm9yJywgZGF0YSk7XG4gICAgICBIYW5kbGViYXJzLmdldFRlbXBsYXRlKCd0cGwvdXNlci1kZXRhaWxzJykudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICAgICAgJCgnIycgKyB1c2VyUHJlZml4KS5hcHBlbmQodGVtcGxhdGUoe2VtYWlsOiBlbWFpbCwgdXNlcm5hbWU6IGdldFVzZXJOaWNrbmFtZUJ5RW1haWwoZW1haWwpLCBoeXBlcnR5VVJMOiBkYXRhLmh5cGVydHlVUkx9KSk7XG4gICAgICAgICQoJyN0YWItbWFuYWdlcicpLnRhYnMoJ3NlbGVjdF90YWInLCB1c2VyUHJlZml4KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbkhhbmRsZWJhcnMuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoSGFuZGxlYmFycy50ZW1wbGF0ZXMgPT09IHVuZGVmaW5lZCB8fCBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBIYW5kbGViYXJzLnRlbXBsYXRlcyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKEhhbmRsZWJhcnMudGVtcGxhdGVzW25hbWVdKTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBuYW1lICsgJy5oYnMnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKTtcbiAgICAgICAgcmVzb2x2ZShIYW5kbGViYXJzLnRlbXBsYXRlc1tuYW1lXSk7XG4gICAgICB9LFxuXG4gICAgICBmYWlsOiBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcbiJdfQ==
