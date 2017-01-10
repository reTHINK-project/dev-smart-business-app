(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.activate = f().default}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

},{}],2:[function(require,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

// Distribution file for HypertyDiscovery.js
// version: 0.2.0

!function (e) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = e();else if ("function" == typeof define && define.amd) define([], e);else {
    var t;t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.HypertyDiscovery = e();
  }
}(function () {
  return function e(t, r, n) {
    function o(c, s) {
      if (!r[c]) {
        if (!t[c]) {
          var u = "function" == typeof require && require;if (!s && u) return u(c, !0);if (i) return i(c, !0);var a = new Error("Cannot find module '" + c + "'");throw a.code = "MODULE_NOT_FOUND", a;
        }var f = r[c] = { exports: {} };t[c][0].call(f.exports, function (e) {
          var r = t[c][1][e];return o(r ? r : e);
        }, f, f.exports, e, t, r, n);
      }return r[c].exports;
    }for (var i = "function" == typeof require && require, c = 0; c < n.length; c++) {
      o(n[c]);
    }return o;
  }({ 1: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/json/stringify"), __esModule: !0 };
    }, { "core-js/library/fn/json/stringify": 6 }], 2: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/define-property"), __esModule: !0 };
    }, { "core-js/library/fn/object/define-property": 7 }], 3: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/promise"), __esModule: !0 };
    }, { "core-js/library/fn/promise": 8 }], 4: [function (e, t, r) {
      "use strict";
      r.__esModule = !0, r["default"] = function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      };
    }, {}], 5: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }r.__esModule = !0;var o = e("babel-runtime/core-js/object/define-property"),
          i = n(o);r["default"] = function () {
        function e(e, t) {
          for (var r = 0; r < t.length; r++) {
            var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), (0, i["default"])(e, n.key, n);
          }
        }return function (t, r, n) {
          return r && e(t.prototype, r), n && e(t, n), t;
        };
      }();
    }, { "babel-runtime/core-js/object/define-property": 2 }], 6: [function (e, t, r) {
      var n = e("../../modules/_core"),
          o = n.JSON || (n.JSON = { stringify: JSON.stringify });t.exports = function (e) {
        return o.stringify.apply(o, arguments);
      };
    }, { "../../modules/_core": 16 }], 7: [function (e, t, r) {
      e("../../modules/es6.object.define-property");var n = e("../../modules/_core").Object;t.exports = function (e, t, r) {
        return n.defineProperty(e, t, r);
      };
    }, { "../../modules/_core": 16, "../../modules/es6.object.define-property": 71 }], 8: [function (e, t, r) {
      e("../modules/es6.object.to-string"), e("../modules/es6.string.iterator"), e("../modules/web.dom.iterable"), e("../modules/es6.promise"), t.exports = e("../modules/_core").Promise;
    }, { "../modules/_core": 16, "../modules/es6.object.to-string": 72, "../modules/es6.promise": 73, "../modules/es6.string.iterator": 74, "../modules/web.dom.iterable": 75 }], 9: [function (e, t, r) {
      t.exports = function (e) {
        if ("function" != typeof e) throw TypeError(e + " is not a function!");return e;
      };
    }, {}], 10: [function (e, t, r) {
      t.exports = function () {};
    }, {}], 11: [function (e, t, r) {
      t.exports = function (e, t, r, n) {
        if (!(e instanceof t) || void 0 !== n && n in e) throw TypeError(r + ": incorrect invocation!");return e;
      };
    }, {}], 12: [function (e, t, r) {
      var n = e("./_is-object");t.exports = function (e) {
        if (!n(e)) throw TypeError(e + " is not an object!");return e;
      };
    }, { "./_is-object": 33 }], 13: [function (e, t, r) {
      var n = e("./_to-iobject"),
          o = e("./_to-length"),
          i = e("./_to-index");t.exports = function (e) {
        return function (t, r, c) {
          var s,
              u = n(t),
              a = o(u.length),
              f = i(c, a);if (e && r != r) {
            for (; a > f;) {
              if (s = u[f++], s != s) return !0;
            }
          } else for (; a > f; f++) {
            if ((e || f in u) && u[f] === r) return e || f || 0;
          }return !e && -1;
        };
      };
    }, { "./_to-index": 61, "./_to-iobject": 63, "./_to-length": 64 }], 14: [function (e, t, r) {
      var n = e("./_cof"),
          o = e("./_wks")("toStringTag"),
          i = "Arguments" == n(function () {
        return arguments;
      }()),
          c = function c(e, t) {
        try {
          return e[t];
        } catch (r) {}
      };t.exports = function (e) {
        var t, r, s;return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (r = c(t = Object(e), o)) ? r : i ? n(t) : "Object" == (s = n(t)) && "function" == typeof t.callee ? "Arguments" : s;
      };
    }, { "./_cof": 15, "./_wks": 68 }], 15: [function (e, t, r) {
      var n = {}.toString;t.exports = function (e) {
        return n.call(e).slice(8, -1);
      };
    }, {}], 16: [function (e, t, r) {
      var n = t.exports = { version: "2.4.0" };"number" == typeof __e && (__e = n);
    }, {}], 17: [function (e, t, r) {
      var n = e("./_a-function");t.exports = function (e, t, r) {
        if (n(e), void 0 === t) return e;switch (r) {case 1:
            return function (r) {
              return e.call(t, r);
            };case 2:
            return function (r, n) {
              return e.call(t, r, n);
            };case 3:
            return function (r, n, o) {
              return e.call(t, r, n, o);
            };}return function () {
          return e.apply(t, arguments);
        };
      };
    }, { "./_a-function": 9 }], 18: [function (e, t, r) {
      t.exports = function (e) {
        if (void 0 == e) throw TypeError("Can't call method on  " + e);return e;
      };
    }, {}], 19: [function (e, t, r) {
      t.exports = !e("./_fails")(function () {
        return 7 != Object.defineProperty({}, "a", { get: function get() {
            return 7;
          } }).a;
      });
    }, { "./_fails": 23 }], 20: [function (e, t, r) {
      var n = e("./_is-object"),
          o = e("./_global").document,
          i = n(o) && n(o.createElement);t.exports = function (e) {
        return i ? o.createElement(e) : {};
      };
    }, { "./_global": 25, "./_is-object": 33 }], 21: [function (e, t, r) {
      t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
    }, {}], 22: [function (e, t, r) {
      var n = e("./_global"),
          o = e("./_core"),
          i = e("./_ctx"),
          c = e("./_hide"),
          s = "prototype",
          u = function u(e, t, r) {
        var a,
            f,
            _,
            l = e & u.F,
            d = e & u.G,
            p = e & u.S,
            v = e & u.P,
            y = e & u.B,
            h = e & u.W,
            b = d ? o : o[t] || (o[t] = {}),
            m = b[s],
            g = d ? n : p ? n[t] : (n[t] || {})[s];d && (r = t);for (a in r) {
          f = !l && g && void 0 !== g[a], f && a in b || (_ = f ? g[a] : r[a], b[a] = d && "function" != typeof g[a] ? r[a] : y && f ? i(_, n) : h && g[a] == _ ? function (e) {
            var t = function t(_t, r, n) {
              if (this instanceof e) {
                switch (arguments.length) {case 0:
                    return new e();case 1:
                    return new e(_t);case 2:
                    return new e(_t, r);}return new e(_t, r, n);
              }return e.apply(this, arguments);
            };return t[s] = e[s], t;
          }(_) : v && "function" == typeof _ ? i(Function.call, _) : _, v && ((b.virtual || (b.virtual = {}))[a] = _, e & u.R && m && !m[a] && c(m, a, _)));
        }
      };u.F = 1, u.G = 2, u.S = 4, u.P = 8, u.B = 16, u.W = 32, u.U = 64, u.R = 128, t.exports = u;
    }, { "./_core": 16, "./_ctx": 17, "./_global": 25, "./_hide": 27 }], 23: [function (e, t, r) {
      t.exports = function (e) {
        try {
          return !!e();
        } catch (t) {
          return !0;
        }
      };
    }, {}], 24: [function (e, t, r) {
      var n = e("./_ctx"),
          o = e("./_iter-call"),
          i = e("./_is-array-iter"),
          c = e("./_an-object"),
          s = e("./_to-length"),
          u = e("./core.get-iterator-method"),
          a = {},
          f = {},
          r = t.exports = function (e, t, r, _, l) {
        var d,
            p,
            v,
            y,
            h = l ? function () {
          return e;
        } : u(e),
            b = n(r, _, t ? 2 : 1),
            m = 0;if ("function" != typeof h) throw TypeError(e + " is not iterable!");if (i(h)) {
          for (d = s(e.length); d > m; m++) {
            if (y = t ? b(c(p = e[m])[0], p[1]) : b(e[m]), y === a || y === f) return y;
          }
        } else for (v = h.call(e); !(p = v.next()).done;) {
          if (y = o(v, b, p.value, t), y === a || y === f) return y;
        }
      };r.BREAK = a, r.RETURN = f;
    }, { "./_an-object": 12, "./_ctx": 17, "./_is-array-iter": 32, "./_iter-call": 34, "./_to-length": 64, "./core.get-iterator-method": 69 }], 25: [function (e, t, r) {
      var n = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();"number" == typeof __g && (__g = n);
    }, {}], 26: [function (e, t, r) {
      var n = {}.hasOwnProperty;t.exports = function (e, t) {
        return n.call(e, t);
      };
    }, {}], 27: [function (e, t, r) {
      var n = e("./_object-dp"),
          o = e("./_property-desc");t.exports = e("./_descriptors") ? function (e, t, r) {
        return n.f(e, t, o(1, r));
      } : function (e, t, r) {
        return e[t] = r, e;
      };
    }, { "./_descriptors": 19, "./_object-dp": 43, "./_property-desc": 50 }], 28: [function (e, t, r) {
      t.exports = e("./_global").document && document.documentElement;
    }, { "./_global": 25 }], 29: [function (e, t, r) {
      t.exports = !e("./_descriptors") && !e("./_fails")(function () {
        return 7 != Object.defineProperty(e("./_dom-create")("div"), "a", { get: function get() {
            return 7;
          } }).a;
      });
    }, { "./_descriptors": 19, "./_dom-create": 20, "./_fails": 23 }], 30: [function (e, t, r) {
      t.exports = function (e, t, r) {
        var n = void 0 === r;switch (t.length) {case 0:
            return n ? e() : e.call(r);case 1:
            return n ? e(t[0]) : e.call(r, t[0]);case 2:
            return n ? e(t[0], t[1]) : e.call(r, t[0], t[1]);case 3:
            return n ? e(t[0], t[1], t[2]) : e.call(r, t[0], t[1], t[2]);case 4:
            return n ? e(t[0], t[1], t[2], t[3]) : e.call(r, t[0], t[1], t[2], t[3]);}return e.apply(r, t);
      };
    }, {}], 31: [function (e, t, r) {
      var n = e("./_cof");t.exports = Object("z").propertyIsEnumerable(0) ? Object : function (e) {
        return "String" == n(e) ? e.split("") : Object(e);
      };
    }, { "./_cof": 15 }], 32: [function (e, t, r) {
      var n = e("./_iterators"),
          o = e("./_wks")("iterator"),
          i = Array.prototype;t.exports = function (e) {
        return void 0 !== e && (n.Array === e || i[o] === e);
      };
    }, { "./_iterators": 39, "./_wks": 68 }], 33: [function (e, t, r) {
      t.exports = function (e) {
        return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) ? null !== e : "function" == typeof e;
      };
    }, {}], 34: [function (e, t, r) {
      var n = e("./_an-object");t.exports = function (e, t, r, o) {
        try {
          return o ? t(n(r)[0], r[1]) : t(r);
        } catch (i) {
          var c = e["return"];throw void 0 !== c && n(c.call(e)), i;
        }
      };
    }, { "./_an-object": 12 }], 35: [function (e, t, r) {
      "use strict";
      var n = e("./_object-create"),
          o = e("./_property-desc"),
          i = e("./_set-to-string-tag"),
          c = {};e("./_hide")(c, e("./_wks")("iterator"), function () {
        return this;
      }), t.exports = function (e, t, r) {
        e.prototype = n(c, { next: o(1, r) }), i(e, t + " Iterator");
      };
    }, { "./_hide": 27, "./_object-create": 42, "./_property-desc": 50, "./_set-to-string-tag": 55, "./_wks": 68 }], 36: [function (e, t, r) {
      "use strict";
      var n = e("./_library"),
          o = e("./_export"),
          i = e("./_redefine"),
          c = e("./_hide"),
          s = e("./_has"),
          u = e("./_iterators"),
          a = e("./_iter-create"),
          f = e("./_set-to-string-tag"),
          _ = e("./_object-gpo"),
          l = e("./_wks")("iterator"),
          d = !([].keys && "next" in [].keys()),
          p = "@@iterator",
          v = "keys",
          y = "values",
          h = function h() {
        return this;
      };t.exports = function (e, t, r, b, m, g, j) {
        a(r, t, b);var x,
            w,
            k,
            O = function O(e) {
          if (!d && e in E) return E[e];switch (e) {case v:
              return function () {
                return new r(this, e);
              };case y:
              return function () {
                return new r(this, e);
              };}return function () {
            return new r(this, e);
          };
        },
            M = t + " Iterator",
            P = m == y,
            S = !1,
            E = e.prototype,
            T = E[l] || E[p] || m && E[m],
            A = T || O(m),
            U = m ? P ? O("entries") : A : void 0,
            C = "Array" == t ? E.entries || T : T;if (C && (k = _(C.call(new e())), k !== Object.prototype && (f(k, M, !0), n || s(k, l) || c(k, l, h))), P && T && T.name !== y && (S = !0, A = function A() {
          return T.call(this);
        }), n && !j || !d && !S && E[l] || c(E, l, A), u[t] = A, u[M] = h, m) if (x = { values: P ? A : O(y), keys: g ? A : O(v), entries: U }, j) for (w in x) {
          w in E || i(E, w, x[w]);
        } else o(o.P + o.F * (d || S), t, x);return x;
      };
    }, { "./_export": 22, "./_has": 26, "./_hide": 27, "./_iter-create": 35, "./_iterators": 39, "./_library": 40, "./_object-gpo": 46, "./_redefine": 52, "./_set-to-string-tag": 55, "./_wks": 68 }], 37: [function (e, t, r) {
      var n = e("./_wks")("iterator"),
          o = !1;try {
        var i = [7][n]();i["return"] = function () {
          o = !0;
        }, Array.from(i, function () {
          throw 2;
        });
      } catch (c) {}t.exports = function (e, t) {
        if (!t && !o) return !1;var r = !1;try {
          var i = [7],
              c = i[n]();c.next = function () {
            return { done: r = !0 };
          }, i[n] = function () {
            return c;
          }, e(i);
        } catch (s) {}return r;
      };
    }, { "./_wks": 68 }], 38: [function (e, t, r) {
      t.exports = function (e, t) {
        return { value: t, done: !!e };
      };
    }, {}], 39: [function (e, t, r) {
      t.exports = {};
    }, {}], 40: [function (e, t, r) {
      t.exports = !0;
    }, {}], 41: [function (e, t, r) {
      var n = e("./_global"),
          o = e("./_task").set,
          i = n.MutationObserver || n.WebKitMutationObserver,
          c = n.process,
          s = n.Promise,
          u = "process" == e("./_cof")(c);t.exports = function () {
        var e,
            t,
            r,
            a = function a() {
          var n, o;for (u && (n = c.domain) && n.exit(); e;) {
            o = e.fn, e = e.next;try {
              o();
            } catch (i) {
              throw e ? r() : t = void 0, i;
            }
          }t = void 0, n && n.enter();
        };if (u) r = function r() {
          c.nextTick(a);
        };else if (i) {
          var f = !0,
              _ = document.createTextNode("");new i(a).observe(_, { characterData: !0 }), r = function r() {
            _.data = f = !f;
          };
        } else if (s && s.resolve) {
          var l = s.resolve();r = function r() {
            l.then(a);
          };
        } else r = function r() {
          o.call(n, a);
        };return function (n) {
          var o = { fn: n, next: void 0 };t && (t.next = o), e || (e = o, r()), t = o;
        };
      };
    }, { "./_cof": 15, "./_global": 25, "./_task": 60 }], 42: [function (e, t, r) {
      var n = e("./_an-object"),
          o = e("./_object-dps"),
          i = e("./_enum-bug-keys"),
          c = e("./_shared-key")("IE_PROTO"),
          s = function s() {},
          u = "prototype",
          _a = function a() {
        var t,
            r = e("./_dom-create")("iframe"),
            n = i.length,
            o = ">";for (r.style.display = "none", e("./_html").appendChild(r), r.src = "javascript:", t = r.contentWindow.document, t.open(), t.write("<script>document.F=Object</script" + o), t.close(), _a = t.F; n--;) {
          delete _a[u][i[n]];
        }return _a();
      };t.exports = Object.create || function (e, t) {
        var r;return null !== e ? (s[u] = n(e), r = new s(), s[u] = null, r[c] = e) : r = _a(), void 0 === t ? r : o(r, t);
      };
    }, { "./_an-object": 12, "./_dom-create": 20, "./_enum-bug-keys": 21, "./_html": 28, "./_object-dps": 44, "./_shared-key": 56 }], 43: [function (e, t, r) {
      var n = e("./_an-object"),
          o = e("./_ie8-dom-define"),
          i = e("./_to-primitive"),
          c = Object.defineProperty;r.f = e("./_descriptors") ? Object.defineProperty : function (e, t, r) {
        if (n(e), t = i(t, !0), n(r), o) try {
          return c(e, t, r);
        } catch (s) {}if ("get" in r || "set" in r) throw TypeError("Accessors not supported!");return "value" in r && (e[t] = r.value), e;
      };
    }, { "./_an-object": 12, "./_descriptors": 19, "./_ie8-dom-define": 29, "./_to-primitive": 66 }], 44: [function (e, t, r) {
      var n = e("./_object-dp"),
          o = e("./_an-object"),
          i = e("./_object-keys");t.exports = e("./_descriptors") ? Object.defineProperties : function (e, t) {
        o(e);for (var r, c = i(t), s = c.length, u = 0; s > u;) {
          n.f(e, r = c[u++], t[r]);
        }return e;
      };
    }, { "./_an-object": 12, "./_descriptors": 19, "./_object-dp": 43, "./_object-keys": 48 }], 45: [function (e, t, r) {
      var n = e("./_object-pie"),
          o = e("./_property-desc"),
          i = e("./_to-iobject"),
          c = e("./_to-primitive"),
          s = e("./_has"),
          u = e("./_ie8-dom-define"),
          a = Object.getOwnPropertyDescriptor;r.f = e("./_descriptors") ? a : function (e, t) {
        if (e = i(e), t = c(t, !0), u) try {
          return a(e, t);
        } catch (r) {}return s(e, t) ? o(!n.f.call(e, t), e[t]) : void 0;
      };
    }, { "./_descriptors": 19, "./_has": 26, "./_ie8-dom-define": 29, "./_object-pie": 49, "./_property-desc": 50, "./_to-iobject": 63, "./_to-primitive": 66 }], 46: [function (e, t, r) {
      var n = e("./_has"),
          o = e("./_to-object"),
          i = e("./_shared-key")("IE_PROTO"),
          c = Object.prototype;t.exports = Object.getPrototypeOf || function (e) {
        return e = o(e), n(e, i) ? e[i] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? c : null;
      };
    }, { "./_has": 26, "./_shared-key": 56, "./_to-object": 65 }], 47: [function (e, t, r) {
      var n = e("./_has"),
          o = e("./_to-iobject"),
          i = e("./_array-includes")(!1),
          c = e("./_shared-key")("IE_PROTO");t.exports = function (e, t) {
        var r,
            s = o(e),
            u = 0,
            a = [];for (r in s) {
          r != c && n(s, r) && a.push(r);
        }for (; t.length > u;) {
          n(s, r = t[u++]) && (~i(a, r) || a.push(r));
        }return a;
      };
    }, { "./_array-includes": 13, "./_has": 26, "./_shared-key": 56, "./_to-iobject": 63 }], 48: [function (e, t, r) {
      var n = e("./_object-keys-internal"),
          o = e("./_enum-bug-keys");t.exports = Object.keys || function (e) {
        return n(e, o);
      };
    }, { "./_enum-bug-keys": 21, "./_object-keys-internal": 47 }], 49: [function (e, t, r) {
      r.f = {}.propertyIsEnumerable;
    }, {}], 50: [function (e, t, r) {
      t.exports = function (e, t) {
        return { enumerable: !(1 & e), configurable: !(2 & e), writable: !(4 & e), value: t };
      };
    }, {}], 51: [function (e, t, r) {
      var n = e("./_hide");t.exports = function (e, t, r) {
        for (var o in t) {
          r && e[o] ? e[o] = t[o] : n(e, o, t[o]);
        }return e;
      };
    }, { "./_hide": 27 }], 52: [function (e, t, r) {
      t.exports = e("./_hide");
    }, { "./_hide": 27 }], 53: [function (e, t, r) {
      var n = e("./_is-object"),
          o = e("./_an-object"),
          i = function i(e, t) {
        if (o(e), !n(t) && null !== t) throw TypeError(t + ": can't set as prototype!");
      };t.exports = { set: Object.setPrototypeOf || ("__proto__" in {} ? function (t, r, n) {
          try {
            n = e("./_ctx")(Function.call, e("./_object-gopd").f(Object.prototype, "__proto__").set, 2), n(t, []), r = !(t instanceof Array);
          } catch (o) {
            r = !0;
          }return function (e, t) {
            return i(e, t), r ? e.__proto__ = t : n(e, t), e;
          };
        }({}, !1) : void 0), check: i };
    }, { "./_an-object": 12, "./_ctx": 17, "./_is-object": 33, "./_object-gopd": 45 }], 54: [function (e, t, r) {
      "use strict";
      var n = e("./_global"),
          o = e("./_core"),
          i = e("./_object-dp"),
          c = e("./_descriptors"),
          s = e("./_wks")("species");t.exports = function (e) {
        var t = "function" == typeof o[e] ? o[e] : n[e];c && t && !t[s] && i.f(t, s, { configurable: !0, get: function get() {
            return this;
          } });
      };
    }, { "./_core": 16, "./_descriptors": 19, "./_global": 25, "./_object-dp": 43, "./_wks": 68 }], 55: [function (e, t, r) {
      var n = e("./_object-dp").f,
          o = e("./_has"),
          i = e("./_wks")("toStringTag");t.exports = function (e, t, r) {
        e && !o(e = r ? e : e.prototype, i) && n(e, i, { configurable: !0, value: t });
      };
    }, { "./_has": 26, "./_object-dp": 43, "./_wks": 68 }], 56: [function (e, t, r) {
      var n = e("./_shared")("keys"),
          o = e("./_uid");t.exports = function (e) {
        return n[e] || (n[e] = o(e));
      };
    }, { "./_shared": 57, "./_uid": 67 }], 57: [function (e, t, r) {
      var n = e("./_global"),
          o = "__core-js_shared__",
          i = n[o] || (n[o] = {});t.exports = function (e) {
        return i[e] || (i[e] = {});
      };
    }, { "./_global": 25 }], 58: [function (e, t, r) {
      var n = e("./_an-object"),
          o = e("./_a-function"),
          i = e("./_wks")("species");t.exports = function (e, t) {
        var r,
            c = n(e).constructor;return void 0 === c || void 0 == (r = n(c)[i]) ? t : o(r);
      };
    }, { "./_a-function": 9, "./_an-object": 12, "./_wks": 68 }], 59: [function (e, t, r) {
      var n = e("./_to-integer"),
          o = e("./_defined");t.exports = function (e) {
        return function (t, r) {
          var i,
              c,
              s = String(o(t)),
              u = n(r),
              a = s.length;return 0 > u || u >= a ? e ? "" : void 0 : (i = s.charCodeAt(u), 55296 > i || i > 56319 || u + 1 === a || (c = s.charCodeAt(u + 1)) < 56320 || c > 57343 ? e ? s.charAt(u) : i : e ? s.slice(u, u + 2) : (i - 55296 << 10) + (c - 56320) + 65536);
        };
      };
    }, { "./_defined": 18, "./_to-integer": 62 }], 60: [function (e, t, r) {
      var n,
          o,
          i,
          c = e("./_ctx"),
          s = e("./_invoke"),
          u = e("./_html"),
          a = e("./_dom-create"),
          f = e("./_global"),
          _ = f.process,
          l = f.setImmediate,
          d = f.clearImmediate,
          p = f.MessageChannel,
          v = 0,
          y = {},
          h = "onreadystatechange",
          b = function b() {
        var e = +this;if (y.hasOwnProperty(e)) {
          var t = y[e];delete y[e], t();
        }
      },
          m = function m(e) {
        b.call(e.data);
      };l && d || (l = function l(e) {
        for (var t = [], r = 1; arguments.length > r;) {
          t.push(arguments[r++]);
        }return y[++v] = function () {
          s("function" == typeof e ? e : Function(e), t);
        }, n(v), v;
      }, d = function d(e) {
        delete y[e];
      }, "process" == e("./_cof")(_) ? n = function n(e) {
        _.nextTick(c(b, e, 1));
      } : p ? (o = new p(), i = o.port2, o.port1.onmessage = m, n = c(i.postMessage, i, 1)) : f.addEventListener && "function" == typeof postMessage && !f.importScripts ? (n = function n(e) {
        f.postMessage(e + "", "*");
      }, f.addEventListener("message", m, !1)) : n = h in a("script") ? function (e) {
        u.appendChild(a("script"))[h] = function () {
          u.removeChild(this), b.call(e);
        };
      } : function (e) {
        setTimeout(c(b, e, 1), 0);
      }), t.exports = { set: l, clear: d };
    }, { "./_cof": 15, "./_ctx": 17, "./_dom-create": 20, "./_global": 25, "./_html": 28, "./_invoke": 30 }], 61: [function (e, t, r) {
      var n = e("./_to-integer"),
          o = Math.max,
          i = Math.min;t.exports = function (e, t) {
        return e = n(e), 0 > e ? o(e + t, 0) : i(e, t);
      };
    }, { "./_to-integer": 62 }], 62: [function (e, t, r) {
      var n = Math.ceil,
          o = Math.floor;t.exports = function (e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? o : n)(e);
      };
    }, {}], 63: [function (e, t, r) {
      var n = e("./_iobject"),
          o = e("./_defined");t.exports = function (e) {
        return n(o(e));
      };
    }, { "./_defined": 18, "./_iobject": 31 }], 64: [function (e, t, r) {
      var n = e("./_to-integer"),
          o = Math.min;t.exports = function (e) {
        return e > 0 ? o(n(e), 9007199254740991) : 0;
      };
    }, { "./_to-integer": 62 }], 65: [function (e, t, r) {
      var n = e("./_defined");t.exports = function (e) {
        return Object(n(e));
      };
    }, { "./_defined": 18 }], 66: [function (e, t, r) {
      var n = e("./_is-object");t.exports = function (e, t) {
        if (!n(e)) return e;var r, o;if (t && "function" == typeof (r = e.toString) && !n(o = r.call(e))) return o;if ("function" == typeof (r = e.valueOf) && !n(o = r.call(e))) return o;if (!t && "function" == typeof (r = e.toString) && !n(o = r.call(e))) return o;throw TypeError("Can't convert object to primitive value");
      };
    }, { "./_is-object": 33 }], 67: [function (e, t, r) {
      var n = 0,
          o = Math.random();t.exports = function (e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++n + o).toString(36));
      };
    }, {}], 68: [function (e, t, r) {
      var n = e("./_shared")("wks"),
          o = e("./_uid"),
          i = e("./_global").Symbol,
          c = "function" == typeof i,
          s = t.exports = function (e) {
        return n[e] || (n[e] = c && i[e] || (c ? i : o)("Symbol." + e));
      };s.store = n;
    }, { "./_global": 25, "./_shared": 57, "./_uid": 67 }], 69: [function (e, t, r) {
      var n = e("./_classof"),
          o = e("./_wks")("iterator"),
          i = e("./_iterators");t.exports = e("./_core").getIteratorMethod = function (e) {
        return void 0 != e ? e[o] || e["@@iterator"] || i[n(e)] : void 0;
      };
    }, { "./_classof": 14, "./_core": 16, "./_iterators": 39, "./_wks": 68 }], 70: [function (e, t, r) {
      "use strict";
      var n = e("./_add-to-unscopables"),
          o = e("./_iter-step"),
          i = e("./_iterators"),
          c = e("./_to-iobject");t.exports = e("./_iter-define")(Array, "Array", function (e, t) {
        this._t = c(e), this._i = 0, this._k = t;
      }, function () {
        var e = this._t,
            t = this._k,
            r = this._i++;return !e || r >= e.length ? (this._t = void 0, o(1)) : "keys" == t ? o(0, r) : "values" == t ? o(0, e[r]) : o(0, [r, e[r]]);
      }, "values"), i.Arguments = i.Array, n("keys"), n("values"), n("entries");
    }, { "./_add-to-unscopables": 10, "./_iter-define": 36, "./_iter-step": 38, "./_iterators": 39, "./_to-iobject": 63 }], 71: [function (e, t, r) {
      var n = e("./_export");n(n.S + n.F * !e("./_descriptors"), "Object", { defineProperty: e("./_object-dp").f });
    }, { "./_descriptors": 19, "./_export": 22, "./_object-dp": 43 }], 72: [function (e, t, r) {}, {}], 73: [function (e, t, r) {
      "use strict";
      var n,
          o,
          i,
          c = e("./_library"),
          s = e("./_global"),
          u = e("./_ctx"),
          a = e("./_classof"),
          f = e("./_export"),
          _ = e("./_is-object"),
          l = (e("./_an-object"), e("./_a-function")),
          d = e("./_an-instance"),
          p = e("./_for-of"),
          v = (e("./_set-proto").set, e("./_species-constructor")),
          y = e("./_task").set,
          h = e("./_microtask")(),
          b = "Promise",
          m = s.TypeError,
          g = s.process,
          _j = s[b],
          g = s.process,
          x = "process" == a(g),
          w = function w() {},
          k = !!function () {
        try {
          var t = _j.resolve(1),
              r = (t.constructor = {})[e("./_wks")("species")] = function (e) {
            e(w, w);
          };return (x || "function" == typeof PromiseRejectionEvent) && t.then(w) instanceof r;
        } catch (n) {}
      }(),
          O = function O(e, t) {
        return e === t || e === _j && t === i;
      },
          M = function M(e) {
        var t;return _(e) && "function" == typeof (t = e.then) ? t : !1;
      },
          P = function P(e) {
        return O(_j, e) ? new S(e) : new o(e);
      },
          S = o = function o(e) {
        var t, r;this.promise = new e(function (e, n) {
          if (void 0 !== t || void 0 !== r) throw m("Bad Promise constructor");t = e, r = n;
        }), this.resolve = l(t), this.reject = l(r);
      },
          E = function E(e) {
        try {
          e();
        } catch (t) {
          return { error: t };
        }
      },
          T = function T(e, t) {
        if (!e._n) {
          e._n = !0;var r = e._c;h(function () {
            for (var n = e._v, o = 1 == e._s, i = 0, c = function c(t) {
              var r,
                  i,
                  c = o ? t.ok : t.fail,
                  s = t.resolve,
                  u = t.reject,
                  a = t.domain;try {
                c ? (o || (2 == e._h && C(e), e._h = 1), c === !0 ? r = n : (a && a.enter(), r = c(n), a && a.exit()), r === t.promise ? u(m("Promise-chain cycle")) : (i = M(r)) ? i.call(r, s, u) : s(r)) : u(n);
              } catch (f) {
                u(f);
              }
            }; r.length > i;) {
              c(r[i++]);
            }e._c = [], e._n = !1, t && !e._h && A(e);
          });
        }
      },
          A = function A(e) {
        y.call(s, function () {
          var t,
              r,
              n,
              o = e._v;if (U(e) && (t = E(function () {
            x ? g.emit("unhandledRejection", o, e) : (r = s.onunhandledrejection) ? r({ promise: e, reason: o }) : (n = s.console) && n.error && n.error("Unhandled promise rejection", o);
          }), e._h = x || U(e) ? 2 : 1), e._a = void 0, t) throw t.error;
        });
      },
          U = function U(e) {
        if (1 == e._h) return !1;for (var t, r = e._a || e._c, n = 0; r.length > n;) {
          if (t = r[n++], t.fail || !U(t.promise)) return !1;
        }return !0;
      },
          C = function C(e) {
        y.call(s, function () {
          var t;x ? g.emit("rejectionHandled", e) : (t = s.onrejectionhandled) && t({ promise: e, reason: e._v });
        });
      },
          R = function R(e) {
        var t = this;t._d || (t._d = !0, t = t._w || t, t._v = e, t._s = 2, t._a || (t._a = t._c.slice()), T(t, !0));
      },
          L = function L(e) {
        var t,
            r = this;if (!r._d) {
          r._d = !0, r = r._w || r;try {
            if (r === e) throw m("Promise can't be resolved itself");(t = M(e)) ? h(function () {
              var n = { _w: r, _d: !1 };try {
                t.call(e, u(L, n, 1), u(R, n, 1));
              } catch (o) {
                R.call(n, o);
              }
            }) : (r._v = e, r._s = 1, T(r, !1));
          } catch (n) {
            R.call({ _w: r, _d: !1 }, n);
          }
        }
      };k || (_j = function j(e) {
        d(this, _j, b, "_h"), l(e), n.call(this);try {
          e(u(L, this, 1), u(R, this, 1));
        } catch (t) {
          R.call(this, t);
        }
      }, n = function n(e) {
        this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, this._n = !1;
      }, n.prototype = e("./_redefine-all")(_j.prototype, { then: function then(e, t) {
          var r = P(v(this, _j));return r.ok = "function" == typeof e ? e : !0, r.fail = "function" == typeof t && t, r.domain = x ? g.domain : void 0, this._c.push(r), this._a && this._a.push(r), this._s && T(this, !1), r.promise;
        }, "catch": function _catch(e) {
          return this.then(void 0, e);
        } }), S = function S() {
        var e = new n();this.promise = e, this.resolve = u(L, e, 1), this.reject = u(R, e, 1);
      }), f(f.G + f.W + f.F * !k, { Promise: _j }), e("./_set-to-string-tag")(_j, b), e("./_set-species")(b), i = e("./_core")[b], f(f.S + f.F * !k, b, { reject: function reject(e) {
          var t = P(this),
              r = t.reject;return r(e), t.promise;
        } }), f(f.S + f.F * (c || !k), b, { resolve: function resolve(e) {
          if (e instanceof _j && O(e.constructor, this)) return e;var t = P(this),
              r = t.resolve;return r(e), t.promise;
        } }), f(f.S + f.F * !(k && e("./_iter-detect")(function (e) {
        _j.all(e)["catch"](w);
      })), b, { all: function all(e) {
          var t = this,
              r = P(t),
              n = r.resolve,
              o = r.reject,
              i = E(function () {
            var r = [],
                i = 0,
                c = 1;p(e, !1, function (e) {
              var s = i++,
                  u = !1;r.push(void 0), c++, t.resolve(e).then(function (e) {
                u || (u = !0, r[s] = e, --c || n(r));
              }, o);
            }), --c || n(r);
          });return i && o(i.error), r.promise;
        }, race: function race(e) {
          var t = this,
              r = P(t),
              n = r.reject,
              o = E(function () {
            p(e, !1, function (e) {
              t.resolve(e).then(r.resolve, n);
            });
          });return o && n(o.error), r.promise;
        } });
    }, { "./_a-function": 9, "./_an-instance": 11, "./_an-object": 12, "./_classof": 14, "./_core": 16, "./_ctx": 17, "./_export": 22, "./_for-of": 24, "./_global": 25, "./_is-object": 33, "./_iter-detect": 37, "./_library": 40, "./_microtask": 41, "./_redefine-all": 51, "./_set-proto": 53, "./_set-species": 54, "./_set-to-string-tag": 55, "./_species-constructor": 58, "./_task": 60, "./_wks": 68 }], 74: [function (e, t, r) {
      "use strict";
      var n = e("./_string-at")(!0);e("./_iter-define")(String, "String", function (e) {
        this._t = String(e), this._i = 0;
      }, function () {
        var e,
            t = this._t,
            r = this._i;return r >= t.length ? { value: void 0, done: !0 } : (e = n(t, r), this._i += e.length, { value: e, done: !1 });
      });
    }, { "./_iter-define": 36, "./_string-at": 59 }], 75: [function (e, t, r) {
      e("./es6.array.iterator");for (var n = e("./_global"), o = e("./_hide"), i = e("./_iterators"), c = e("./_wks")("toStringTag"), s = ["NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList"], u = 0; 5 > u; u++) {
        var a = s[u],
            f = n[a],
            _ = f && f.prototype;_ && !_[c] && o(_, c, a), i[a] = i.Array;
      }
    }, { "./_global": 25, "./_hide": 27, "./_iterators": 39, "./_wks": 68, "./es6.array.iterator": 70 }], 76: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("./hyperty-discovery/HypertyDiscovery"),
          i = n(o);r["default"] = i["default"], t.exports = r["default"];
    }, { "./hyperty-discovery/HypertyDiscovery": 77 }], 77: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/core-js/promise"),
          i = n(o),
          c = e("babel-runtime/helpers/classCallCheck"),
          s = n(c),
          u = e("babel-runtime/helpers/createClass"),
          a = n(u),
          f = e("../utils/utils"),
          _ = function () {
        function e(t, r) {
          (0, s["default"])(this, e);var n = this;n.messageBus = r, n.domain = (0, f.divideURL)(t).domain, n.discoveryURL = t;
        }return (0, a["default"])(e, [{ key: "discoverDataObjectPerName", value: function value(e, t) {
            var r = this,
                n = void 0;n = t ? t : r.domain;var o = { type: "read", from: r.discoveryURL, to: "domain://registry." + n + "/", body: { resource: "dataObject://" + e } };return new i["default"](function (e, t) {
              r.messageBus.postMessage(o, function (r) {
                var n = r.body.value.url;n ? e(n) : t("DataObject name does not exist");
              });
            });
          } }, { key: "discoverHypertyPerUser", value: function value(e, t) {
            var r = this,
                n = void 0;n = t ? t : r.domain;var o = "user://" + e.substring(e.indexOf("@") + 1, e.length) + "/" + e.substring(0, e.indexOf("@")),
                c = { type: "read", from: r.discoveryURL, to: "domain://registry." + n + "/", body: { resource: o } };return console.log("Message: ", c, n, o), new i["default"](function (t, n) {
              r.messageBus.postMessage(c, function (r) {
                console.log("message reply", r);var o = void 0,
                    i = void 0,
                    c = void 0,
                    s = r.body.value;for (o in s) {
                  if (void 0 !== s[o].lastModified) if (void 0 === i) i = new Date(s[o].lastModified), c = o;else {
                    var u = new Date(s[o].lastModified);i.getTime() < u.getTime() && (i = u, c = o);
                  }
                }console.log("Last Hyperty: ", c, i);var a = c;if (void 0 === a) return n("User Hyperty not found");var f = { id: e, descriptor: s[a].descriptor, hypertyURL: a };console.log("===> hypertyDiscovery messageBundle: ", f), t(f);
              });
            });
          } }, { key: "discoverHypertiesPerUser", value: function value(e, t) {
            var r = this,
                n = void 0;n = t ? t : r.domain;var o = "user://" + e.substring(e.indexOf("@") + 1, e.length) + "/" + e.substring(0, e.indexOf("@")),
                c = { type: "read", from: r.discoveryURL, to: "domain://registry." + n + "/", body: { resource: o } };return console.log("Message discoverHypertiesPerUser: ", c, n, o), new i["default"](function (e, t) {
              r.messageBus.postMessage(c, function (r) {
                console.log("discoverHypertiesPerUser reply", r);var n = r.body.value;return n ? void e(n) : t("User Hyperty not found");
              });
            });
          } }]), e;
      }();r["default"] = _, t.exports = r["default"];
    }, { "../utils/utils": 78, "babel-runtime/core-js/promise": 3, "babel-runtime/helpers/classCallCheck": 4, "babel-runtime/helpers/createClass": 5 }], 78: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }function o(e) {
        var t = /([a-zA-Z-]*):\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi,
            r = "$1,$2,$3",
            n = e.replace(t, r).split(",");n[0] === e && (n[0] = "https", n[1] = e);var o = { type: n[0], domain: n[1], identity: n[2] };return o;
      }function i(e) {
        return e ? JSON.parse((0, s["default"])(e)) : void 0;
      }Object.defineProperty(r, "__esModule", { value: !0 });var c = e("babel-runtime/core-js/json/stringify"),
          s = n(c);r.divideURL = o, r.deepClone = i;
    }, { "babel-runtime/core-js/json/stringify": 1 }] }, {}, [76])(76);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

// Distribution file for Syncher.js
// version: 0.2.0

!function (e) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = e();else if ("function" == typeof define && define.amd) define([], e);else {
    var t;t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.Syncher = e();
  }
}(function () {
  return function e(t, r, n) {
    function o(s, a) {
      if (!r[s]) {
        if (!t[s]) {
          var c = "function" == typeof require && require;if (!a && c) return c(s, !0);if (i) return i(s, !0);var u = new Error("Cannot find module '" + s + "'");throw u.code = "MODULE_NOT_FOUND", u;
        }var l = r[s] = { exports: {} };t[s][0].call(l.exports, function (e) {
          var r = t[s][1][e];return o(r ? r : e);
        }, l, l.exports, e, t, r, n);
      }return r[s].exports;
    }for (var i = "function" == typeof require && require, s = 0; s < n.length; s++) {
      o(n[s]);
    }return o;
  }({ 1: [function (e, t, r) {
      Object.observe && !Array.observe && function (e, t) {
        "use strict";
        var r = e.getNotifier,
            n = "performChange",
            o = "_original",
            i = "splice",
            s = { push: function c(e) {
            var t = arguments,
                s = c[o].apply(this, t);return r(this)[n](i, function () {
              return { index: s - t.length, addedCount: t.length, removed: [] };
            }), s;
          }, unshift: function u(e) {
            var t = arguments,
                s = u[o].apply(this, t);return r(this)[n](i, function () {
              return { index: 0, addedCount: t.length, removed: [] };
            }), s;
          }, pop: function l() {
            var e = this.length,
                t = l[o].call(this);return this.length !== e && r(this)[n](i, function () {
              return { index: this.length, addedCount: 0, removed: [t] };
            }, this), t;
          }, shift: function f() {
            var e = this.length,
                t = f[o].call(this);return this.length !== e && r(this)[n](i, function () {
              return { index: 0, addedCount: 0, removed: [t] };
            }, this), t;
          }, splice: function d(e, t) {
            var s = arguments,
                a = d[o].apply(this, s);return (a.length || s.length > 2) && r(this)[n](i, function () {
              return { index: e, addedCount: s.length - 2, removed: a };
            }, this), a;
          } };for (var a in s) {
          s[a][o] = t.prototype[a], t.prototype[a] = s[a];
        }t.observe = function (t, r) {
          return e.observe(t, r, ["add", "update", "delete", i]);
        }, t.unobserve = e.unobserve;
      }(Object, Array);
    }, {}], 2: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/json/stringify"), __esModule: !0 };
    }, { "core-js/library/fn/json/stringify": 17 }], 3: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/create"), __esModule: !0 };
    }, { "core-js/library/fn/object/create": 18 }], 4: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/define-property"), __esModule: !0 };
    }, { "core-js/library/fn/object/define-property": 19 }], 5: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/get-own-property-descriptor"), __esModule: !0 };
    }, { "core-js/library/fn/object/get-own-property-descriptor": 20 }], 6: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/get-prototype-of"), __esModule: !0 };
    }, { "core-js/library/fn/object/get-prototype-of": 21 }], 7: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/keys"), __esModule: !0 };
    }, { "core-js/library/fn/object/keys": 22 }], 8: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/object/set-prototype-of"), __esModule: !0 };
    }, { "core-js/library/fn/object/set-prototype-of": 23 }], 9: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/promise"), __esModule: !0 };
    }, { "core-js/library/fn/promise": 24 }], 10: [function (e, t, r) {
      t.exports = { "default": e("core-js/library/fn/symbol"), __esModule: !0 };
    }, { "core-js/library/fn/symbol": 25 }], 11: [function (e, t, r) {
      "use strict";
      r.__esModule = !0, r["default"] = function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      };
    }, {}], 12: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }r.__esModule = !0;var o = e("../core-js/object/define-property"),
          i = n(o);r["default"] = function () {
        function e(e, t) {
          for (var r = 0; r < t.length; r++) {
            var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), (0, i["default"])(e, n.key, n);
          }
        }return function (t, r, n) {
          return r && e(t.prototype, r), n && e(t, n), t;
        };
      }();
    }, { "../core-js/object/define-property": 4 }], 13: [function (e, t, r) {
      "use strict";
      var n = e("babel-runtime/core-js/object/get-own-property-descriptor")["default"];r["default"] = function (e, t, r) {
        for (var o = !0; o;) {
          var i = e,
              s = t,
              a = r;o = !1, null === i && (i = Function.prototype);var c = n(i, s);if (void 0 !== c) {
            if ("value" in c) return c.value;var u = c.get;if (void 0 === u) return;return u.call(a);
          }var l = Object.getPrototypeOf(i);if (null === l) return;e = l, t = s, r = a, o = !0, c = l = void 0;
        }
      }, r.__esModule = !0;
    }, { "babel-runtime/core-js/object/get-own-property-descriptor": 5 }], 14: [function (e, t, r) {
      "use strict";
      var n = e("babel-runtime/core-js/object/create")["default"],
          o = e("babel-runtime/core-js/object/set-prototype-of")["default"];r["default"] = function (e, t) {
        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = n(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (o ? o(e, t) : e.__proto__ = t);
      }, r.__esModule = !0;
    }, { "babel-runtime/core-js/object/create": 3, "babel-runtime/core-js/object/set-prototype-of": 8 }], 15: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }r.__esModule = !0;var o = e("../helpers/typeof"),
          i = n(o);r["default"] = function (e, t) {
        if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" !== ("undefined" == typeof t ? "undefined" : (0, i["default"])(t)) && "function" != typeof t ? e : t;
      };
    }, { "../helpers/typeof": 16 }], 16: [function (e, t, r) {
      "use strict";
      var n = e("babel-runtime/core-js/symbol")["default"];r["default"] = function (e) {
        return e && e.constructor === n ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
      }, r.__esModule = !0;
    }, { "babel-runtime/core-js/symbol": 10 }], 17: [function (e, t, r) {
      var n = e("../../modules/$.core");t.exports = function (e) {
        return (n.JSON && n.JSON.stringify || JSON.stringify).apply(JSON, arguments);
      };
    }, { "../../modules/$.core": 31 }], 18: [function (e, t, r) {
      var n = e("../../modules/$");t.exports = function (e, t) {
        return n.create(e, t);
      };
    }, { "../../modules/$": 56 }], 19: [function (e, t, r) {
      var n = e("../../modules/$");t.exports = function (e, t, r) {
        return n.setDesc(e, t, r);
      };
    }, { "../../modules/$": 56 }], 20: [function (e, t, r) {
      var n = e("../../modules/$");e("../../modules/es6.object.get-own-property-descriptor"), t.exports = function (e, t) {
        return n.getDesc(e, t);
      };
    }, { "../../modules/$": 56, "../../modules/es6.object.get-own-property-descriptor": 81 }], 21: [function (e, t, r) {
      e("../../modules/es6.object.get-prototype-of"), t.exports = e("../../modules/$.core").Object.getPrototypeOf;
    }, { "../../modules/$.core": 31, "../../modules/es6.object.get-prototype-of": 82 }], 22: [function (e, t, r) {
      e("../../modules/es6.object.keys"), t.exports = e("../../modules/$.core").Object.keys;
    }, { "../../modules/$.core": 31, "../../modules/es6.object.keys": 83 }], 23: [function (e, t, r) {
      e("../../modules/es6.object.set-prototype-of"), t.exports = e("../../modules/$.core").Object.setPrototypeOf;
    }, { "../../modules/$.core": 31, "../../modules/es6.object.set-prototype-of": 84 }], 24: [function (e, t, r) {
      e("../modules/es6.object.to-string"), e("../modules/es6.string.iterator"), e("../modules/web.dom.iterable"), e("../modules/es6.promise"), t.exports = e("../modules/$.core").Promise;
    }, { "../modules/$.core": 31, "../modules/es6.object.to-string": 85, "../modules/es6.promise": 86, "../modules/es6.string.iterator": 87, "../modules/web.dom.iterable": 89 }], 25: [function (e, t, r) {
      e("../../modules/es6.symbol"), e("../../modules/es6.object.to-string"), t.exports = e("../../modules/$.core").Symbol;
    }, { "../../modules/$.core": 31, "../../modules/es6.object.to-string": 85, "../../modules/es6.symbol": 88 }], 26: [function (e, t, r) {
      t.exports = function (e) {
        if ("function" != typeof e) throw TypeError(e + " is not a function!");return e;
      };
    }, {}], 27: [function (e, t, r) {
      t.exports = function () {};
    }, {}], 28: [function (e, t, r) {
      var n = e("./$.is-object");t.exports = function (e) {
        if (!n(e)) throw TypeError(e + " is not an object!");return e;
      };
    }, { "./$.is-object": 49 }], 29: [function (e, t, r) {
      var n = e("./$.cof"),
          o = e("./$.wks")("toStringTag"),
          i = "Arguments" == n(function () {
        return arguments;
      }());t.exports = function (e) {
        var t, r, s;return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (r = (t = Object(e))[o]) ? r : i ? n(t) : "Object" == (s = n(t)) && "function" == typeof t.callee ? "Arguments" : s;
      };
    }, { "./$.cof": 30, "./$.wks": 78 }], 30: [function (e, t, r) {
      var n = {}.toString;t.exports = function (e) {
        return n.call(e).slice(8, -1);
      };
    }, {}], 31: [function (e, t, r) {
      var n = t.exports = { version: "1.2.6" };"number" == typeof __e && (__e = n);
    }, {}], 32: [function (e, t, r) {
      var n = e("./$.a-function");t.exports = function (e, t, r) {
        if (n(e), void 0 === t) return e;switch (r) {case 1:
            return function (r) {
              return e.call(t, r);
            };case 2:
            return function (r, n) {
              return e.call(t, r, n);
            };case 3:
            return function (r, n, o) {
              return e.call(t, r, n, o);
            };}return function () {
          return e.apply(t, arguments);
        };
      };
    }, { "./$.a-function": 26 }], 33: [function (e, t, r) {
      t.exports = function (e) {
        if (void 0 == e) throw TypeError("Can't call method on  " + e);return e;
      };
    }, {}], 34: [function (e, t, r) {
      t.exports = !e("./$.fails")(function () {
        return 7 != Object.defineProperty({}, "a", { get: function get() {
            return 7;
          } }).a;
      });
    }, { "./$.fails": 38 }], 35: [function (e, t, r) {
      var n = e("./$.is-object"),
          o = e("./$.global").document,
          i = n(o) && n(o.createElement);t.exports = function (e) {
        return i ? o.createElement(e) : {};
      };
    }, { "./$.global": 41, "./$.is-object": 49 }], 36: [function (e, t, r) {
      var n = e("./$");t.exports = function (e) {
        var t = n.getKeys(e),
            r = n.getSymbols;if (r) for (var o, i = r(e), s = n.isEnum, a = 0; i.length > a;) {
          s.call(e, o = i[a++]) && t.push(o);
        }return t;
      };
    }, { "./$": 56 }], 37: [function (e, t, r) {
      var n = e("./$.global"),
          o = e("./$.core"),
          i = e("./$.ctx"),
          s = "prototype",
          a = function a(e, t, r) {
        var c,
            u,
            l,
            f = e & a.F,
            d = e & a.G,
            p = e & a.S,
            b = e & a.P,
            h = e & a.B,
            v = e & a.W,
            y = d ? o : o[t] || (o[t] = {}),
            _ = d ? n : p ? n[t] : (n[t] || {})[s];d && (r = t);for (c in r) {
          u = !f && _ && c in _, u && c in y || (l = u ? _[c] : r[c], y[c] = d && "function" != typeof _[c] ? r[c] : h && u ? i(l, n) : v && _[c] == l ? function (e) {
            var t = function t(_t) {
              return this instanceof e ? new e(_t) : e(_t);
            };return t[s] = e[s], t;
          }(l) : b && "function" == typeof l ? i(Function.call, l) : l, b && ((y[s] || (y[s] = {}))[c] = l));
        }
      };a.F = 1, a.G = 2, a.S = 4, a.P = 8, a.B = 16, a.W = 32, t.exports = a;
    }, { "./$.core": 31, "./$.ctx": 32, "./$.global": 41 }], 38: [function (e, t, r) {
      t.exports = function (e) {
        try {
          return !!e();
        } catch (t) {
          return !0;
        }
      };
    }, {}], 39: [function (e, t, r) {
      var n = e("./$.ctx"),
          o = e("./$.iter-call"),
          i = e("./$.is-array-iter"),
          s = e("./$.an-object"),
          a = e("./$.to-length"),
          c = e("./core.get-iterator-method");t.exports = function (e, t, r, u) {
        var l,
            f,
            d,
            p = c(e),
            b = n(r, u, t ? 2 : 1),
            h = 0;if ("function" != typeof p) throw TypeError(e + " is not iterable!");if (i(p)) for (l = a(e.length); l > h; h++) {
          t ? b(s(f = e[h])[0], f[1]) : b(e[h]);
        } else for (d = p.call(e); !(f = d.next()).done;) {
          o(d, b, f.value, t);
        }
      };
    }, { "./$.an-object": 28, "./$.ctx": 32, "./$.is-array-iter": 47, "./$.iter-call": 50, "./$.to-length": 75, "./core.get-iterator-method": 79 }], 40: [function (e, t, r) {
      var n = e("./$.to-iobject"),
          o = e("./$").getNames,
          i = {}.toString,
          s = "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [],
          a = function a(e) {
        try {
          return o(e);
        } catch (t) {
          return s.slice();
        }
      };t.exports.get = function (e) {
        return s && "[object Window]" == i.call(e) ? a(e) : o(n(e));
      };
    }, { "./$": 56, "./$.to-iobject": 74 }], 41: [function (e, t, r) {
      var n = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();"number" == typeof __g && (__g = n);
    }, {}], 42: [function (e, t, r) {
      var n = {}.hasOwnProperty;t.exports = function (e, t) {
        return n.call(e, t);
      };
    }, {}], 43: [function (e, t, r) {
      var n = e("./$"),
          o = e("./$.property-desc");t.exports = e("./$.descriptors") ? function (e, t, r) {
        return n.setDesc(e, t, o(1, r));
      } : function (e, t, r) {
        return e[t] = r, e;
      };
    }, { "./$": 56, "./$.descriptors": 34, "./$.property-desc": 61 }], 44: [function (e, t, r) {
      t.exports = e("./$.global").document && document.documentElement;
    }, { "./$.global": 41 }], 45: [function (e, t, r) {
      t.exports = function (e, t, r) {
        var n = void 0 === r;switch (t.length) {case 0:
            return n ? e() : e.call(r);case 1:
            return n ? e(t[0]) : e.call(r, t[0]);case 2:
            return n ? e(t[0], t[1]) : e.call(r, t[0], t[1]);case 3:
            return n ? e(t[0], t[1], t[2]) : e.call(r, t[0], t[1], t[2]);case 4:
            return n ? e(t[0], t[1], t[2], t[3]) : e.call(r, t[0], t[1], t[2], t[3]);}return e.apply(r, t);
      };
    }, {}], 46: [function (e, t, r) {
      var n = e("./$.cof");t.exports = Object("z").propertyIsEnumerable(0) ? Object : function (e) {
        return "String" == n(e) ? e.split("") : Object(e);
      };
    }, { "./$.cof": 30 }], 47: [function (e, t, r) {
      var n = e("./$.iterators"),
          o = e("./$.wks")("iterator"),
          i = Array.prototype;t.exports = function (e) {
        return void 0 !== e && (n.Array === e || i[o] === e);
      };
    }, { "./$.iterators": 55, "./$.wks": 78 }], 48: [function (e, t, r) {
      var n = e("./$.cof");t.exports = Array.isArray || function (e) {
        return "Array" == n(e);
      };
    }, { "./$.cof": 30 }], 49: [function (e, t, r) {
      t.exports = function (e) {
        return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) ? null !== e : "function" == typeof e;
      };
    }, {}], 50: [function (e, t, r) {
      var n = e("./$.an-object");t.exports = function (e, t, r, o) {
        try {
          return o ? t(n(r)[0], r[1]) : t(r);
        } catch (i) {
          var s = e["return"];throw void 0 !== s && n(s.call(e)), i;
        }
      };
    }, { "./$.an-object": 28 }], 51: [function (e, t, r) {
      "use strict";
      var n = e("./$"),
          o = e("./$.property-desc"),
          i = e("./$.set-to-string-tag"),
          s = {};e("./$.hide")(s, e("./$.wks")("iterator"), function () {
        return this;
      }), t.exports = function (e, t, r) {
        e.prototype = n.create(s, { next: o(1, r) }), i(e, t + " Iterator");
      };
    }, { "./$": 56, "./$.hide": 43, "./$.property-desc": 61, "./$.set-to-string-tag": 67, "./$.wks": 78 }], 52: [function (e, t, r) {
      "use strict";
      var n = e("./$.library"),
          o = e("./$.export"),
          i = e("./$.redefine"),
          s = e("./$.hide"),
          a = e("./$.has"),
          c = e("./$.iterators"),
          u = e("./$.iter-create"),
          l = e("./$.set-to-string-tag"),
          f = e("./$").getProto,
          d = e("./$.wks")("iterator"),
          p = !([].keys && "next" in [].keys()),
          b = "@@iterator",
          h = "keys",
          v = "values",
          y = function y() {
        return this;
      };t.exports = function (e, t, r, _, g, m, j) {
        u(r, t, _);var $,
            O,
            w = function w(e) {
          if (!p && e in E) return E[e];switch (e) {case h:
              return function () {
                return new r(this, e);
              };case v:
              return function () {
                return new r(this, e);
              };}return function () {
            return new r(this, e);
          };
        },
            k = t + " Iterator",
            x = g == v,
            C = !1,
            E = e.prototype,
            S = E[d] || E[b] || g && E[g],
            T = S || w(g);if (S) {
          var M = f(T.call(new e()));l(M, k, !0), !n && a(E, b) && s(M, d, y), x && S.name !== v && (C = !0, T = function T() {
            return S.call(this);
          });
        }if (n && !j || !p && !C && E[d] || s(E, d, T), c[t] = T, c[k] = y, g) if ($ = { values: x ? T : w(v), keys: m ? T : w(h), entries: x ? w("entries") : T }, j) for (O in $) {
          O in E || i(E, O, $[O]);
        } else o(o.P + o.F * (p || C), t, $);return $;
      };
    }, { "./$": 56, "./$.export": 37, "./$.has": 42, "./$.hide": 43, "./$.iter-create": 51, "./$.iterators": 55, "./$.library": 58, "./$.redefine": 63, "./$.set-to-string-tag": 67, "./$.wks": 78 }], 53: [function (e, t, r) {
      var n = e("./$.wks")("iterator"),
          o = !1;try {
        var i = [7][n]();i["return"] = function () {
          o = !0;
        }, Array.from(i, function () {
          throw 2;
        });
      } catch (s) {}t.exports = function (e, t) {
        if (!t && !o) return !1;var r = !1;try {
          var i = [7],
              s = i[n]();s.next = function () {
            r = !0;
          }, i[n] = function () {
            return s;
          }, e(i);
        } catch (a) {}return r;
      };
    }, { "./$.wks": 78 }], 54: [function (e, t, r) {
      t.exports = function (e, t) {
        return { value: t, done: !!e };
      };
    }, {}], 55: [function (e, t, r) {
      t.exports = {};
    }, {}], 56: [function (e, t, r) {
      var n = Object;t.exports = { create: n.create, getProto: n.getPrototypeOf, isEnum: {}.propertyIsEnumerable, getDesc: n.getOwnPropertyDescriptor, setDesc: n.defineProperty, setDescs: n.defineProperties, getKeys: n.keys, getNames: n.getOwnPropertyNames, getSymbols: n.getOwnPropertySymbols, each: [].forEach };
    }, {}], 57: [function (e, t, r) {
      var n = e("./$"),
          o = e("./$.to-iobject");t.exports = function (e, t) {
        for (var r, i = o(e), s = n.getKeys(i), a = s.length, c = 0; a > c;) {
          if (i[r = s[c++]] === t) return r;
        }
      };
    }, { "./$": 56, "./$.to-iobject": 74 }], 58: [function (e, t, r) {
      t.exports = !0;
    }, {}], 59: [function (e, t, r) {
      var n,
          o,
          i,
          s = e("./$.global"),
          a = e("./$.task").set,
          c = s.MutationObserver || s.WebKitMutationObserver,
          u = s.process,
          l = s.Promise,
          f = "process" == e("./$.cof")(u),
          d = function d() {
        var e, t, r;for (f && (e = u.domain) && (u.domain = null, e.exit()); n;) {
          t = n.domain, r = n.fn, t && t.enter(), r(), t && t.exit(), n = n.next;
        }o = void 0, e && e.enter();
      };if (f) i = function i() {
        u.nextTick(d);
      };else if (c) {
        var p = 1,
            b = document.createTextNode("");new c(d).observe(b, { characterData: !0 }), i = function i() {
          b.data = p = -p;
        };
      } else i = l && l.resolve ? function () {
        l.resolve().then(d);
      } : function () {
        a.call(s, d);
      };t.exports = function (e) {
        var t = { fn: e, next: void 0, domain: f && u.domain };o && (o.next = t), n || (n = t, i()), o = t;
      };
    }, { "./$.cof": 30, "./$.global": 41, "./$.task": 72 }], 60: [function (e, t, r) {
      var n = e("./$.export"),
          o = e("./$.core"),
          i = e("./$.fails");t.exports = function (e, t) {
        var r = (o.Object || {})[e] || Object[e],
            s = {};s[e] = t(r), n(n.S + n.F * i(function () {
          r(1);
        }), "Object", s);
      };
    }, { "./$.core": 31, "./$.export": 37, "./$.fails": 38 }], 61: [function (e, t, r) {
      t.exports = function (e, t) {
        return { enumerable: !(1 & e), configurable: !(2 & e), writable: !(4 & e), value: t };
      };
    }, {}], 62: [function (e, t, r) {
      var n = e("./$.redefine");t.exports = function (e, t) {
        for (var r in t) {
          n(e, r, t[r]);
        }return e;
      };
    }, { "./$.redefine": 63 }], 63: [function (e, t, r) {
      t.exports = e("./$.hide");
    }, { "./$.hide": 43 }], 64: [function (e, t, r) {
      t.exports = Object.is || function (e, t) {
        return e === t ? 0 !== e || 1 / e === 1 / t : e != e && t != t;
      };
    }, {}], 65: [function (e, t, r) {
      var n = e("./$").getDesc,
          o = e("./$.is-object"),
          i = e("./$.an-object"),
          s = function s(e, t) {
        if (i(e), !o(t) && null !== t) throw TypeError(t + ": can't set as prototype!");
      };t.exports = { set: Object.setPrototypeOf || ("__proto__" in {} ? function (t, r, o) {
          try {
            o = e("./$.ctx")(Function.call, n(Object.prototype, "__proto__").set, 2), o(t, []), r = !(t instanceof Array);
          } catch (i) {
            r = !0;
          }return function (e, t) {
            return s(e, t), r ? e.__proto__ = t : o(e, t), e;
          };
        }({}, !1) : void 0), check: s };
    }, { "./$": 56, "./$.an-object": 28, "./$.ctx": 32, "./$.is-object": 49 }], 66: [function (e, t, r) {
      "use strict";
      var n = e("./$.core"),
          o = e("./$"),
          i = e("./$.descriptors"),
          s = e("./$.wks")("species");t.exports = function (e) {
        var t = n[e];i && t && !t[s] && o.setDesc(t, s, { configurable: !0, get: function get() {
            return this;
          } });
      };
    }, { "./$": 56, "./$.core": 31, "./$.descriptors": 34, "./$.wks": 78 }], 67: [function (e, t, r) {
      var n = e("./$").setDesc,
          o = e("./$.has"),
          i = e("./$.wks")("toStringTag");t.exports = function (e, t, r) {
        e && !o(e = r ? e : e.prototype, i) && n(e, i, { configurable: !0, value: t });
      };
    }, { "./$": 56, "./$.has": 42, "./$.wks": 78 }], 68: [function (e, t, r) {
      var n = e("./$.global"),
          o = "__core-js_shared__",
          i = n[o] || (n[o] = {});t.exports = function (e) {
        return i[e] || (i[e] = {});
      };
    }, { "./$.global": 41 }], 69: [function (e, t, r) {
      var n = e("./$.an-object"),
          o = e("./$.a-function"),
          i = e("./$.wks")("species");t.exports = function (e, t) {
        var r,
            s = n(e).constructor;return void 0 === s || void 0 == (r = n(s)[i]) ? t : o(r);
      };
    }, { "./$.a-function": 26, "./$.an-object": 28, "./$.wks": 78 }], 70: [function (e, t, r) {
      t.exports = function (e, t, r) {
        if (!(e instanceof t)) throw TypeError(r + ": use the 'new' operator!");return e;
      };
    }, {}], 71: [function (e, t, r) {
      var n = e("./$.to-integer"),
          o = e("./$.defined");t.exports = function (e) {
        return function (t, r) {
          var i,
              s,
              a = String(o(t)),
              c = n(r),
              u = a.length;return 0 > c || c >= u ? e ? "" : void 0 : (i = a.charCodeAt(c), 55296 > i || i > 56319 || c + 1 === u || (s = a.charCodeAt(c + 1)) < 56320 || s > 57343 ? e ? a.charAt(c) : i : e ? a.slice(c, c + 2) : (i - 55296 << 10) + (s - 56320) + 65536);
        };
      };
    }, { "./$.defined": 33, "./$.to-integer": 73 }], 72: [function (e, t, r) {
      var n,
          o,
          i,
          s = e("./$.ctx"),
          a = e("./$.invoke"),
          c = e("./$.html"),
          u = e("./$.dom-create"),
          l = e("./$.global"),
          f = l.process,
          d = l.setImmediate,
          p = l.clearImmediate,
          b = l.MessageChannel,
          h = 0,
          v = {},
          y = "onreadystatechange",
          _ = function _() {
        var e = +this;if (v.hasOwnProperty(e)) {
          var t = v[e];delete v[e], t();
        }
      },
          g = function g(e) {
        _.call(e.data);
      };d && p || (d = function d(e) {
        for (var t = [], r = 1; arguments.length > r;) {
          t.push(arguments[r++]);
        }return v[++h] = function () {
          a("function" == typeof e ? e : Function(e), t);
        }, n(h), h;
      }, p = function p(e) {
        delete v[e];
      }, "process" == e("./$.cof")(f) ? n = function n(e) {
        f.nextTick(s(_, e, 1));
      } : b ? (o = new b(), i = o.port2, o.port1.onmessage = g, n = s(i.postMessage, i, 1)) : l.addEventListener && "function" == typeof postMessage && !l.importScripts ? (n = function n(e) {
        l.postMessage(e + "", "*");
      }, l.addEventListener("message", g, !1)) : n = y in u("script") ? function (e) {
        c.appendChild(u("script"))[y] = function () {
          c.removeChild(this), _.call(e);
        };
      } : function (e) {
        setTimeout(s(_, e, 1), 0);
      }), t.exports = { set: d, clear: p };
    }, { "./$.cof": 30, "./$.ctx": 32, "./$.dom-create": 35, "./$.global": 41, "./$.html": 44, "./$.invoke": 45 }], 73: [function (e, t, r) {
      var n = Math.ceil,
          o = Math.floor;t.exports = function (e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? o : n)(e);
      };
    }, {}], 74: [function (e, t, r) {
      var n = e("./$.iobject"),
          o = e("./$.defined");t.exports = function (e) {
        return n(o(e));
      };
    }, { "./$.defined": 33, "./$.iobject": 46 }], 75: [function (e, t, r) {
      var n = e("./$.to-integer"),
          o = Math.min;t.exports = function (e) {
        return e > 0 ? o(n(e), 9007199254740991) : 0;
      };
    }, { "./$.to-integer": 73 }], 76: [function (e, t, r) {
      var n = e("./$.defined");t.exports = function (e) {
        return Object(n(e));
      };
    }, { "./$.defined": 33 }], 77: [function (e, t, r) {
      var n = 0,
          o = Math.random();t.exports = function (e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++n + o).toString(36));
      };
    }, {}], 78: [function (e, t, r) {
      var n = e("./$.shared")("wks"),
          o = e("./$.uid"),
          i = e("./$.global").Symbol;t.exports = function (e) {
        return n[e] || (n[e] = i && i[e] || (i || o)("Symbol." + e));
      };
    }, { "./$.global": 41, "./$.shared": 68, "./$.uid": 77 }], 79: [function (e, t, r) {
      var n = e("./$.classof"),
          o = e("./$.wks")("iterator"),
          i = e("./$.iterators");t.exports = e("./$.core").getIteratorMethod = function (e) {
        return void 0 != e ? e[o] || e["@@iterator"] || i[n(e)] : void 0;
      };
    }, { "./$.classof": 29, "./$.core": 31, "./$.iterators": 55, "./$.wks": 78 }], 80: [function (e, t, r) {
      "use strict";
      var n = e("./$.add-to-unscopables"),
          o = e("./$.iter-step"),
          i = e("./$.iterators"),
          s = e("./$.to-iobject");t.exports = e("./$.iter-define")(Array, "Array", function (e, t) {
        this._t = s(e), this._i = 0, this._k = t;
      }, function () {
        var e = this._t,
            t = this._k,
            r = this._i++;return !e || r >= e.length ? (this._t = void 0, o(1)) : "keys" == t ? o(0, r) : "values" == t ? o(0, e[r]) : o(0, [r, e[r]]);
      }, "values"), i.Arguments = i.Array, n("keys"), n("values"), n("entries");
    }, { "./$.add-to-unscopables": 27, "./$.iter-define": 52, "./$.iter-step": 54, "./$.iterators": 55, "./$.to-iobject": 74 }], 81: [function (e, t, r) {
      var n = e("./$.to-iobject");e("./$.object-sap")("getOwnPropertyDescriptor", function (e) {
        return function (t, r) {
          return e(n(t), r);
        };
      });
    }, { "./$.object-sap": 60, "./$.to-iobject": 74 }], 82: [function (e, t, r) {
      var n = e("./$.to-object");e("./$.object-sap")("getPrototypeOf", function (e) {
        return function (t) {
          return e(n(t));
        };
      });
    }, { "./$.object-sap": 60, "./$.to-object": 76 }], 83: [function (e, t, r) {
      var n = e("./$.to-object");e("./$.object-sap")("keys", function (e) {
        return function (t) {
          return e(n(t));
        };
      });
    }, { "./$.object-sap": 60, "./$.to-object": 76 }], 84: [function (e, t, r) {
      var n = e("./$.export");n(n.S, "Object", { setPrototypeOf: e("./$.set-proto").set });
    }, { "./$.export": 37, "./$.set-proto": 65 }], 85: [function (e, t, r) {}, {}], 86: [function (e, t, r) {
      "use strict";
      var n,
          o = e("./$"),
          i = e("./$.library"),
          s = e("./$.global"),
          a = e("./$.ctx"),
          c = e("./$.classof"),
          u = e("./$.export"),
          l = e("./$.is-object"),
          f = e("./$.an-object"),
          d = e("./$.a-function"),
          p = e("./$.strict-new"),
          b = e("./$.for-of"),
          h = e("./$.set-proto").set,
          v = e("./$.same-value"),
          y = e("./$.wks")("species"),
          _ = e("./$.species-constructor"),
          g = e("./$.microtask"),
          m = "Promise",
          j = s.process,
          $ = "process" == c(j),
          _O = s[m],
          w = function w(e) {
        var t = new _O(function () {});return e && (t.constructor = Object), _O.resolve(t) === t;
      },
          k = function () {
        function t(e) {
          var r = new _O(e);return h(r, t.prototype), r;
        }var r = !1;try {
          if (r = _O && _O.resolve && w(), h(t, _O), t.prototype = o.create(_O.prototype, { constructor: { value: t } }), t.resolve(5).then(function () {}) instanceof t || (r = !1), r && e("./$.descriptors")) {
            var n = !1;_O.resolve(o.setDesc({}, "then", { get: function get() {
                n = !0;
              } })), r = n;
          }
        } catch (i) {
          r = !1;
        }return r;
      }(),
          x = function x(e, t) {
        return i && e === _O && t === n ? !0 : v(e, t);
      },
          C = function C(e) {
        var t = f(e)[y];return void 0 != t ? t : e;
      },
          E = function E(e) {
        var t;return l(e) && "function" == typeof (t = e.then) ? t : !1;
      },
          S = function S(e) {
        var t, r;this.promise = new e(function (e, n) {
          if (void 0 !== t || void 0 !== r) throw TypeError("Bad Promise constructor");t = e, r = n;
        }), this.resolve = d(t), this.reject = d(r);
      },
          T = function T(e) {
        try {
          e();
        } catch (t) {
          return { error: t };
        }
      },
          M = function M(e, t) {
        if (!e.n) {
          e.n = !0;var r = e.c;g(function () {
            for (var n = e.v, o = 1 == e.s, i = 0, a = function a(t) {
              var r,
                  i,
                  s = o ? t.ok : t.fail,
                  a = t.resolve,
                  c = t.reject;try {
                s ? (o || (e.h = !0), r = s === !0 ? n : s(n), r === t.promise ? c(TypeError("Promise-chain cycle")) : (i = E(r)) ? i.call(r, a, c) : a(r)) : c(n);
              } catch (u) {
                c(u);
              }
            }; r.length > i;) {
              a(r[i++]);
            }r.length = 0, e.n = !1, t && setTimeout(function () {
              var t,
                  r,
                  o = e.p;N(o) && ($ ? j.emit("unhandledRejection", n, o) : (t = s.onunhandledrejection) ? t({ promise: o, reason: n }) : (r = s.console) && r.error && r.error("Unhandled promise rejection", n)), e.a = void 0;
            }, 1);
          });
        }
      },
          N = function N(e) {
        var t,
            r = e._d,
            n = r.a || r.c,
            o = 0;if (r.h) return !1;for (; n.length > o;) {
          if (t = n[o++], t.fail || !N(t.promise)) return !1;
        }return !0;
      },
          R = function R(e) {
        var t = this;t.d || (t.d = !0, t = t.r || t, t.v = e, t.s = 2, t.a = t.c.slice(), M(t, !0));
      },
          D = function D(e) {
        var t,
            r = this;if (!r.d) {
          r.d = !0, r = r.r || r;try {
            if (r.p === e) throw TypeError("Promise can't be resolved itself");(t = E(e)) ? g(function () {
              var n = { r: r, d: !1 };try {
                t.call(e, a(D, n, 1), a(R, n, 1));
              } catch (o) {
                R.call(n, o);
              }
            }) : (r.v = e, r.s = 1, M(r, !1));
          } catch (n) {
            R.call({ r: r, d: !1 }, n);
          }
        }
      };k || (_O = function O(e) {
        d(e);var t = this._d = { p: p(this, _O, m), c: [], a: void 0, s: 0, d: !1, v: void 0, h: !1, n: !1 };try {
          e(a(D, t, 1), a(R, t, 1));
        } catch (r) {
          R.call(t, r);
        }
      }, e("./$.redefine-all")(_O.prototype, { then: function then(e, t) {
          var r = new S(_(this, _O)),
              n = r.promise,
              o = this._d;return r.ok = "function" == typeof e ? e : !0, r.fail = "function" == typeof t && t, o.c.push(r), o.a && o.a.push(r), o.s && M(o, !1), n;
        }, "catch": function _catch(e) {
          return this.then(void 0, e);
        } })), u(u.G + u.W + u.F * !k, { Promise: _O }), e("./$.set-to-string-tag")(_O, m), e("./$.set-species")(m), n = e("./$.core")[m], u(u.S + u.F * !k, m, { reject: function reject(e) {
          var t = new S(this),
              r = t.reject;return r(e), t.promise;
        } }), u(u.S + u.F * (!k || w(!0)), m, { resolve: function resolve(e) {
          if (e instanceof _O && x(e.constructor, this)) return e;var t = new S(this),
              r = t.resolve;return r(e), t.promise;
        } }), u(u.S + u.F * !(k && e("./$.iter-detect")(function (e) {
        _O.all(e)["catch"](function () {});
      })), m, { all: function all(e) {
          var t = C(this),
              r = new S(t),
              n = r.resolve,
              i = r.reject,
              s = [],
              a = T(function () {
            b(e, !1, s.push, s);var r = s.length,
                a = Array(r);r ? o.each.call(s, function (e, o) {
              var s = !1;t.resolve(e).then(function (e) {
                s || (s = !0, a[o] = e, --r || n(a));
              }, i);
            }) : n(a);
          });return a && i(a.error), r.promise;
        }, race: function race(e) {
          var t = C(this),
              r = new S(t),
              n = r.reject,
              o = T(function () {
            b(e, !1, function (e) {
              t.resolve(e).then(r.resolve, n);
            });
          });return o && n(o.error), r.promise;
        } });
    }, { "./$": 56, "./$.a-function": 26, "./$.an-object": 28, "./$.classof": 29, "./$.core": 31, "./$.ctx": 32, "./$.descriptors": 34, "./$.export": 37, "./$.for-of": 39, "./$.global": 41, "./$.is-object": 49, "./$.iter-detect": 53, "./$.library": 58, "./$.microtask": 59, "./$.redefine-all": 62, "./$.same-value": 64, "./$.set-proto": 65, "./$.set-species": 66, "./$.set-to-string-tag": 67, "./$.species-constructor": 69, "./$.strict-new": 70, "./$.wks": 78 }], 87: [function (e, t, r) {
      "use strict";
      var n = e("./$.string-at")(!0);e("./$.iter-define")(String, "String", function (e) {
        this._t = String(e), this._i = 0;
      }, function () {
        var e,
            t = this._t,
            r = this._i;return r >= t.length ? { value: void 0, done: !0 } : (e = n(t, r), this._i += e.length, { value: e, done: !1 });
      });
    }, { "./$.iter-define": 52, "./$.string-at": 71 }], 88: [function (e, t, r) {
      "use strict";
      var n = e("./$"),
          o = e("./$.global"),
          i = e("./$.has"),
          s = e("./$.descriptors"),
          a = e("./$.export"),
          c = e("./$.redefine"),
          u = e("./$.fails"),
          l = e("./$.shared"),
          f = e("./$.set-to-string-tag"),
          d = e("./$.uid"),
          p = e("./$.wks"),
          b = e("./$.keyof"),
          h = e("./$.get-names"),
          v = e("./$.enum-keys"),
          y = e("./$.is-array"),
          _ = e("./$.an-object"),
          g = e("./$.to-iobject"),
          m = e("./$.property-desc"),
          j = n.getDesc,
          $ = n.setDesc,
          O = n.create,
          w = h.get,
          k = o.Symbol,
          x = o.JSON,
          C = x && x.stringify,
          E = !1,
          S = p("_hidden"),
          T = n.isEnum,
          M = l("symbol-registry"),
          N = l("symbols"),
          R = "function" == typeof k,
          D = Object.prototype,
          P = s && u(function () {
        return 7 != O($({}, "a", { get: function get() {
            return $(this, "a", { value: 7 }).a;
          } })).a;
      }) ? function (e, t, r) {
        var n = j(D, t);n && delete D[t], $(e, t, r), n && e !== D && $(D, t, n);
      } : $,
          A = function A(e) {
        var t = N[e] = O(k.prototype);return t._k = e, s && E && P(D, e, { configurable: !0, set: function set(t) {
            i(this, S) && i(this[S], e) && (this[S][e] = !1), P(this, e, m(1, t));
          } }), t;
      },
          L = function L(e) {
        return "symbol" == (typeof e === "undefined" ? "undefined" : _typeof(e));
      },
          I = function I(e, t, r) {
        return r && i(N, t) ? (r.enumerable ? (i(e, S) && e[S][t] && (e[S][t] = !1), r = O(r, { enumerable: m(0, !1) })) : (i(e, S) || $(e, S, m(1, {})), e[S][t] = !0), P(e, t, r)) : $(e, t, r);
      },
          F = function F(e, t) {
        _(e);for (var r, n = v(t = g(t)), o = 0, i = n.length; i > o;) {
          I(e, r = n[o++], t[r]);
        }return e;
      },
          V = function V(e, t) {
        return void 0 === t ? O(e) : F(O(e), t);
      },
          z = function z(e) {
        var t = T.call(this, e);return t || !i(this, e) || !i(N, e) || i(this, S) && this[S][e] ? t : !0;
      },
          U = function U(e, t) {
        var r = j(e = g(e), t);return !r || !i(N, t) || i(e, S) && e[S][t] || (r.enumerable = !0), r;
      },
          H = function H(e) {
        for (var t, r = w(g(e)), n = [], o = 0; r.length > o;) {
          i(N, t = r[o++]) || t == S || n.push(t);
        }return n;
      },
          B = function B(e) {
        for (var t, r = w(g(e)), n = [], o = 0; r.length > o;) {
          i(N, t = r[o++]) && n.push(N[t]);
        }return n;
      },
          J = function J(e) {
        if (void 0 !== e && !L(e)) {
          for (var t, r, n = [e], o = 1, i = arguments; i.length > o;) {
            n.push(i[o++]);
          }return t = n[1], "function" == typeof t && (r = t), !r && y(t) || (t = function t(e, _t2) {
            return r && (_t2 = r.call(this, e, _t2)), L(_t2) ? void 0 : _t2;
          }), n[1] = t, C.apply(x, n);
        }
      },
          W = u(function () {
        var e = k();return "[null]" != C([e]) || "{}" != C({ a: e }) || "{}" != C(Object(e));
      });R || (k = function k() {
        if (L(this)) throw TypeError("Symbol is not a constructor");return A(d(arguments.length > 0 ? arguments[0] : void 0));
      }, c(k.prototype, "toString", function () {
        return this._k;
      }), L = function L(e) {
        return e instanceof k;
      }, n.create = V, n.isEnum = z, n.getDesc = U, n.setDesc = I, n.setDescs = F, n.getNames = h.get = H, n.getSymbols = B, s && !e("./$.library") && c(D, "propertyIsEnumerable", z, !0));var Y = { "for": function _for(e) {
          return i(M, e += "") ? M[e] : M[e] = k(e);
        }, keyFor: function keyFor(e) {
          return b(M, e);
        }, useSetter: function useSetter() {
          E = !0;
        }, useSimple: function useSimple() {
          E = !1;
        } };n.each.call("hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), function (e) {
        var t = p(e);Y[e] = R ? t : A(t);
      }), E = !0, a(a.G + a.W, { Symbol: k }), a(a.S, "Symbol", Y), a(a.S + a.F * !R, "Object", { create: V, defineProperty: I, defineProperties: F, getOwnPropertyDescriptor: U, getOwnPropertyNames: H, getOwnPropertySymbols: B }), x && a(a.S + a.F * (!R || W), "JSON", { stringify: J }), f(k, "Symbol"), f(Math, "Math", !0), f(o.JSON, "JSON", !0);
    }, { "./$": 56, "./$.an-object": 28, "./$.descriptors": 34, "./$.enum-keys": 36, "./$.export": 37, "./$.fails": 38, "./$.get-names": 40, "./$.global": 41, "./$.has": 42, "./$.is-array": 48, "./$.keyof": 57, "./$.library": 58, "./$.property-desc": 61, "./$.redefine": 63, "./$.set-to-string-tag": 67, "./$.shared": 68, "./$.to-iobject": 74, "./$.uid": 77, "./$.wks": 78 }], 89: [function (e, t, r) {
      e("./es6.array.iterator");var n = e("./$.iterators");n.NodeList = n.HTMLCollection = n.Array;
    }, { "./$.iterators": 55, "./es6.array.iterator": 80 }], 90: [function (e, t, r) {
      window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || function (e) {
        function t(e) {
          this.g = [], this.k = e;
        }function r(e) {
          !function r() {
            var n = e.takeRecords();n.length && e.k(n, e), e.f = setTimeout(r, t._period);
          }();
        }function n(t) {
          var r,
              n = { type: null, target: null, addedNodes: [], removedNodes: [], previousSibling: null, nextSibling: null, attributeName: null, attributeNamespace: null, oldValue: null };for (r in t) {
            n[r] !== e && t[r] !== e && (n[r] = t[r]);
          }return n;
        }function o(e, t) {
          var r = a(e, t);return function (n) {
            var o,
                c = n.length;t.a && r.a && i(n, e, r.a, t.d), (t.b || t.e) && (o = s(n, e, r, t)), (o || n.length !== c) && (r = a(e, t));
          };
        }function i(t, r, o, i) {
          for (var s, a, c = {}, u = r.attributes, l = u.length; l--;) {
            s = u[l], a = s.name, i && i[a] === e || (s.value !== o[a] && t.push(n({ type: "attributes", target: r, attributeName: a, oldValue: o[a], attributeNamespace: s.namespaceURI })), c[a] = !0);
          }for (a in o) {
            c[a] || t.push(n({ target: r, type: "attributes", attributeName: a, oldValue: o[a] }));
          }
        }function s(t, r, o, s) {
          function a(e, r, o, a, c) {
            var l = e.length - 1;c = - ~((l - c) / 2);for (var f, d, p; p = e.pop();) {
              f = o[p.h], d = a[p.i], s.b && c && Math.abs(p.h - p.i) >= l && (t.push(n({ type: "childList", target: r, addedNodes: [f], removedNodes: [f], nextSibling: f.nextSibling, previousSibling: f.previousSibling })), c--), s.a && d.a && i(t, f, d.a, s.d), s.c && 3 === f.nodeType && f.nodeValue !== d.c && t.push(n({ type: "characterData", target: f })), s.e && u(f, d);
            }
          }function u(r, o) {
            for (var d, p, b, h, v, y = r.childNodes, _ = o.b, g = y.length, m = _ ? _.length : 0, j = 0, $ = 0, O = 0; g > $ || m > O;) {
              h = y[$], v = (b = _[O]) && b.j, h === v ? (s.a && b.a && i(t, h, b.a, s.d), s.c && b.c !== e && h.nodeValue !== b.c && t.push(n({ type: "characterData", target: h })), p && a(p, r, y, _, j), s.e && (h.childNodes.length || b.b && b.b.length) && u(h, b), $++, O++) : (l = !0, d || (d = {}, p = []), h && (d[b = c(h)] || (d[b] = !0, -1 === (b = f(_, h, O, "j")) ? s.b && (t.push(n({ type: "childList", target: r, addedNodes: [h], nextSibling: h.nextSibling, previousSibling: h.previousSibling })), j++) : p.push({ h: $, i: b })), $++), v && v !== y[$] && (d[b = c(v)] || (d[b] = !0, -1 === (b = f(y, v, $)) ? s.b && (t.push(n({ type: "childList", target: o.j, removedNodes: [v], nextSibling: _[O + 1], previousSibling: _[O - 1] })), j--) : p.push({ h: b, i: O })), O++));
            }p && a(p, r, y, _, j);
          }var l;return u(r, o), l;
        }function a(e, t) {
          var r = !0;return function n(e) {
            var o = { j: e };return !t.c || 3 !== e.nodeType && 8 !== e.nodeType ? (t.a && r && 1 === e.nodeType && (o.a = l(e.attributes, function (e, r) {
              return t.d && !t.d[r.name] || (e[r.name] = r.value), e;
            })), r && (t.b || t.c || t.a && t.e) && (o.b = u(e.childNodes, n)), r = t.e) : o.c = e.nodeValue, o;
          }(e);
        }function c(e) {
          try {
            return e.id || (e.mo_id = e.mo_id || d++);
          } catch (t) {
            try {
              return e.nodeValue;
            } catch (r) {
              return d++;
            }
          }
        }function u(e, t) {
          for (var r = [], n = 0; n < e.length; n++) {
            r[n] = t(e[n], n, e);
          }return r;
        }function l(e, t) {
          for (var r = {}, n = 0; n < e.length; n++) {
            r = t(r, e[n], n, e);
          }return r;
        }function f(e, t, r, n) {
          for (; r < e.length; r++) {
            if ((n ? e[r][n] : e[r]) === t) return r;
          }return -1;
        }t._period = 30, t.prototype = { observe: function observe(e, t) {
            for (var n = { a: !!(t.attributes || t.attributeFilter || t.attributeOldValue), b: !!t.childList, e: !!t.subtree, c: !(!t.characterData && !t.characterDataOldValue) }, i = this.g, s = 0; s < i.length; s++) {
              i[s].m === e && i.splice(s, 1);
            }t.attributeFilter && (n.d = l(t.attributeFilter, function (e, t) {
              return e[t] = !0, e;
            })), i.push({ m: e, l: o(e, n) }), this.f || r(this);
          }, takeRecords: function takeRecords() {
            for (var e = [], t = this.g, r = 0; r < t.length; r++) {
              t[r].l(e);
            }return e;
          }, disconnect: function disconnect() {
            this.g = [], clearTimeout(this.f), this.f = null;
          } };var d = 1;return t;
      }(void 0);
    }, {}], 91: [function (e, t, r) {
      Object.observe || function (e, t, r, n) {
        "use strict";
        var o,
            i,
            s = ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"],
            a = t.isArray || function (e) {
          return function (t) {
            return "[object Array]" === e.call(t);
          };
        }(e.prototype.toString),
            c = t.prototype.indexOf ? t.indexOf || function (e, r, n) {
          return t.prototype.indexOf.call(e, r, n);
        } : function (e, t, r) {
          for (var n = r || 0; n < e.length; n++) {
            if (e[n] === t) return n;
          }return -1;
        },
            u = r.Map !== n && Map.prototype.forEach ? function () {
          return new Map();
        } : function () {
          var e = [],
              t = [];return { size: 0, has: function has(t) {
              return c(e, t) > -1;
            }, get: function get(r) {
              return t[c(e, r)];
            }, set: function set(r, n) {
              var o = c(e, r);-1 === o ? (e.push(r), t.push(n), this.size++) : t[o] = n;
            }, "delete": function _delete(r) {
              var n = c(e, r);n > -1 && (e.splice(n, 1), t.splice(n, 1), this.size--);
            }, forEach: function forEach(r) {
              for (var n = 0; n < e.length; n++) {
                r.call(arguments[1], t[n], e[n], this);
              }
            } };
        },
            l = e.getOwnPropertyNames ? function () {
          var t = e.getOwnPropertyNames;try {
            arguments.callee;
          } catch (r) {
            var n = (t(c).join(" ") + " ").replace(/prototype |length |name /g, "").slice(0, -1).split(" ");n.length && (t = function t(_t3) {
              var r = e.getOwnPropertyNames(_t3);if ("function" == typeof _t3) for (var o, i = 0; i < n.length;) {
                (o = c(r, n[i++])) > -1 && r.splice(o, 1);
              }return r;
            });
          }return t;
        }() : function (t) {
          var r,
              n,
              o = [];if ("hasOwnProperty" in t) for (r in t) {
            t.hasOwnProperty(r) && o.push(r);
          } else {
            n = e.hasOwnProperty;for (r in t) {
              n.call(t, r) && o.push(r);
            }
          }return a(t) && o.push("length"), o;
        },
            f = e.getPrototypeOf,
            d = e.defineProperties && e.getOwnPropertyDescriptor,
            p = r.requestAnimationFrame || r.webkitRequestAnimationFrame || function () {
          var e = +new Date(),
              t = e;return function (r) {
            return setTimeout(function () {
              r((t = +new Date()) - e);
            }, 17);
          };
        }(),
            b = function b(e, t, r) {
          var n = o.get(e);n ? (v(n, e), m(e, n, t, r)) : (n = h(e), m(e, n, t, r), 1 === o.size && p(y));
        },
            h = function h(t, r) {
          var n,
              i = l(t),
              s = [],
              a = 0,
              r = { handlers: u(), frozen: e.isFrozen ? e.isFrozen(t) : !1, extensible: e.isExtensible ? e.isExtensible(t) : !0, proto: f && f(t), properties: i, values: s, notifier: g(t, r) };if (d) for (n = r.descriptors = []; a < i.length;) {
            n[a] = d(t, i[a]), s[a] = t[i[a++]];
          } else for (; a < i.length;) {
            s[a] = t[i[a++]];
          }return o.set(t, r), r;
        },
            v = function () {
          var t = d ? function (e, t, r, n, o) {
            var i = t.properties[r],
                s = e[i],
                a = t.values[r],
                c = t.descriptors[r];"value" in o && (a === s ? 0 === a && 1 / a !== 1 / s : a === a || s === s) && (j(e, t, { name: i, type: "update", object: e, oldValue: a }, n), t.values[r] = s), !c.configurable || o.configurable && o.writable === c.writable && o.enumerable === c.enumerable && o.get === c.get && o.set === c.set || (j(e, t, { name: i, type: "reconfigure", object: e, oldValue: a }, n), t.descriptors[r] = o);
          } : function (e, t, r, n) {
            var o = t.properties[r],
                i = e[o],
                s = t.values[r];(s === i ? 0 === s && 1 / s !== 1 / i : s === s || i === i) && (j(e, t, { name: o, type: "update", object: e, oldValue: s }, n), t.values[r] = i);
          },
              r = d ? function (e, r, n, o, i) {
            for (var s, a = r.length; n && a--;) {
              null !== r[a] && (s = d(e, r[a]), n--, s ? t(e, o, a, i, s) : (j(e, o, { name: r[a], type: "delete", object: e, oldValue: o.values[a] }, i), o.properties.splice(a, 1), o.values.splice(a, 1), o.descriptors.splice(a, 1)));
            }
          } : function (e, t, r, n, o) {
            for (var i = t.length; r && i--;) {
              null !== t[i] && (j(e, n, { name: t[i], type: "delete", object: e, oldValue: n.values[i] }, o), n.properties.splice(i, 1), n.values.splice(i, 1), r--);
            }
          };return function (n, o, i) {
            if (n.handlers.size && !n.frozen) {
              var s,
                  a,
                  u,
                  p,
                  b,
                  h,
                  v,
                  y,
                  _ = n.values,
                  g = n.descriptors,
                  m = 0;if (n.extensible) {
                if (s = n.properties.slice(), a = s.length, u = l(o), g) {
                  for (; m < u.length;) {
                    b = u[m++], p = c(s, b), y = d(o, b), -1 === p ? (j(o, n, { name: b, type: "add", object: o }, i), n.properties.push(b), _.push(o[b]), g.push(y)) : (s[p] = null, a--, t(o, n, p, i, y));
                  }r(o, s, a, n, i), e.isExtensible(o) || (n.extensible = !1, j(o, n, { type: "preventExtensions", object: o }, i), n.frozen = e.isFrozen(o));
                } else {
                  for (; m < u.length;) {
                    b = u[m++], p = c(s, b), h = o[b], -1 === p ? (j(o, n, { name: b, type: "add", object: o }, i), n.properties.push(b), _.push(h)) : (s[p] = null, a--, t(o, n, p, i));
                  }r(o, s, a, n, i);
                }
              } else if (!n.frozen) {
                for (; m < s.length; m++) {
                  b = s[m], t(o, n, m, i, d(o, b));
                }e.isFrozen(o) && (n.frozen = !0);
              }f && (v = f(o), v !== n.proto && (j(o, n, { type: "setPrototype", name: "__proto__", object: o, oldValue: n.proto }), n.proto = v));
            }
          };
        }(),
            y = function y() {
          o.size && (o.forEach(v), i.forEach(_), p(y));
        },
            _ = function _(e, t) {
          var r = e.changeRecords;r.length && (e.changeRecords = [], t(r));
        },
            g = function g(e, t) {
          return arguments.length < 2 && (t = o.get(e)), t && t.notifier || { notify: function notify(t) {
              t.type;var r = o.get(e);if (r) {
                var n,
                    i = { object: e };for (n in t) {
                  "object" !== n && (i[n] = t[n]);
                }j(e, r, i);
              }
            }, performChange: function performChange(t, r) {
              if ("string" != typeof t) throw new TypeError("Invalid non-string changeType");if ("function" != typeof r) throw new TypeError("Cannot perform non-function");var i,
                  s,
                  a = o.get(e),
                  c = arguments[2],
                  u = c === n ? r() : r.call(c);if (a && v(a, e, t), a && u && "object" == (typeof u === "undefined" ? "undefined" : _typeof(u))) {
                s = { object: e, type: t };for (i in u) {
                  "object" !== i && "type" !== i && (s[i] = u[i]);
                }j(e, a, s);
              }
            } };
        },
            m = function m(e, t, r, n) {
          var o = i.get(r);o || i.set(r, o = { observed: u(), changeRecords: [] }), o.observed.set(e, { acceptList: n.slice(), data: t }), t.handlers.set(r, o);
        },
            j = function j(e, t, r, n) {
          t.handlers.forEach(function (t) {
            var o = t.observed.get(e).acceptList;("string" != typeof n || -1 === c(o, n)) && c(o, r.type) > -1 && t.changeRecords.push(r);
          });
        };o = u(), i = u(), e.observe = function (t, r, o) {
          if (!t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t) throw new TypeError("Object.observe cannot observe non-object");if ("function" != typeof r) throw new TypeError("Object.observe cannot deliver to non-function");if (e.isFrozen && e.isFrozen(r)) throw new TypeError("Object.observe cannot deliver to a frozen function object");if (o === n) o = s;else if (!o || "object" != (typeof o === "undefined" ? "undefined" : _typeof(o))) throw new TypeError("Third argument to Object.observe must be an array of strings.");return b(t, r, o), t;
        }, e.unobserve = function (e, t) {
          if (null === e || "object" != (typeof e === "undefined" ? "undefined" : _typeof(e)) && "function" != typeof e) throw new TypeError("Object.unobserve cannot unobserve non-object");if ("function" != typeof t) throw new TypeError("Object.unobserve cannot deliver to non-function");var r,
              n = i.get(t);return n && (r = n.observed.get(e)) && (n.observed.forEach(function (e, t) {
            v(e.data, t);
          }), p(function () {
            _(n, t);
          }), 1 === n.observed.size && n.observed.has(e) ? i["delete"](t) : n.observed["delete"](e), 1 === r.data.handlers.size ? o["delete"](e) : r.data.handlers["delete"](t)), e;
        }, e.getNotifier = function (t) {
          if (null === t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t) throw new TypeError("Object.getNotifier cannot getNotifier non-object");return e.isFrozen && e.isFrozen(t) ? null : g(t);
        }, e.deliverChangeRecords = function (e) {
          if ("function" != typeof e) throw new TypeError("Object.deliverChangeRecords cannot deliver to non-function");var t = i.get(e);t && (t.observed.forEach(function (e, t) {
            v(e.data, t);
          }), _(t, e));
        };
      }(Object, Array, this);
    }, {}], 92: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 }), r.DataObjectObserver = r.DataObjectReporter = r.Syncher = void 0, e("mutationobserver-shim"), e("object.observe"), e("array.observe");var o = e("./syncher/Syncher"),
          i = n(o),
          s = e("./syncher/DataObjectReporter"),
          a = n(s),
          c = e("./syncher/DataObjectObserver"),
          u = n(c);r.Syncher = i["default"], r.DataObjectReporter = a["default"], r.DataObjectObserver = u["default"];
    }, { "./syncher/DataObjectObserver": 95, "./syncher/DataObjectReporter": 96, "./syncher/Syncher": 99, "array.observe": 1, "mutationobserver-shim": 90, "object.observe": 91 }], 93: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/core-js/promise"),
          i = n(o),
          s = e("babel-runtime/core-js/object/keys"),
          a = n(s),
          c = e("babel-runtime/helpers/classCallCheck"),
          u = n(c),
          l = e("babel-runtime/helpers/createClass"),
          f = n(l),
          d = e("./SyncObject"),
          p = n(d),
          b = e("./DataObjectChild"),
          h = n(b),
          v = e("../utils/utils.js"),
          y = function () {
        function e(t, r, n, o, i, s) {
          (0, u["default"])(this, e);var a = this;a._syncher = t, a._url = r, a._schema = n, a._status = o, a._syncObj = new p["default"](i), a._childrens = s, a._version = 0, a._childId = 0, a._childrenObjects = {}, a._childrenListeners = [], a._owner = t._owner, a._bus = t._bus;
        }return (0, f["default"])(e, [{ key: "_allocateListeners", value: function value() {
            var e = this,
                t = this,
                r = t._url + "/children/";t._childrens && t._childrens.forEach(function (n) {
              var o = r + n,
                  i = t._bus.addListener(o, function (r) {
                if (r.from !== e._owner) switch (console.log("DataObject-Children-RCV: ", r), r.type) {case "create":
                    t._onChildCreate(r);break;case "delete":
                    console.log(r);break;default:
                    t._changeChildren(r);}
              });t._childrenListeners.push(i);
            });
          } }, { key: "_releaseListeners", value: function value() {
            var e = this;e._childrenListeners.forEach(function (e) {
              e.remove();
            }), (0, a["default"])(e._childrenObjects).forEach(function (t) {
              e._childrenObjects[t]._releaseListeners();
            });
          } }, { key: "pause", value: function value() {
            throw "Not implemented";
          } }, { key: "resume", value: function value() {
            throw "Not implemented";
          } }, { key: "stop", value: function value() {
            throw "Not implemented";
          } }, { key: "addChild", value: function value(e, t) {
            var r = this;r._childId++;var n = r._owner + "#" + r._childId,
                o = r._url + "/children/" + e,
                s = { type: "create", from: r._owner, to: o, body: { resource: n, value: t } };return new i["default"](function (e) {
              var i = r._bus.postMessage(s);console.log("create-reporter-child( " + r._owner + " ): ", s);var a = new h["default"](r, n, t, r._owner, i);a.onChange(function (e) {
                r._onChange(e, { path: o, childId: n });
              }), r._childrenObjects[n] = a, e(a);
            });
          } }, { key: "onAddChild", value: function value(e) {
            this._onAddChildrenHandler = e;
          } }, { key: "_onChildCreate", value: function value(e) {
            var t = this,
                r = e.body.resource;console.log("create-observer-child( " + t._owner + " ): ", e);var n = new h["default"](t, r, e.body.value);t._childrenObjects[r] = n, setTimeout(function () {
              t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: 200, source: t._owner } });
            });var o = { type: e.type, from: e.from, url: e.to, value: e.body.value, childId: r, identity: e.body.identity };t._onAddChildrenHandler && (console.log("ADD-CHILDREN-EVENT: ", o), t._onAddChildrenHandler(o));
          } }, { key: "_onChange", value: function value(e, t) {
            var r = this;if (r._version++, "on" === r._status) {
              var n = { type: "update", from: r._url, to: r._url + "/changes", body: { version: r._version, source: r._owner, attribute: e.field } };e.oType === d.ObjectType.OBJECT ? e.cType !== d.ChangeType.REMOVE && (n.body.value = e.data) : (n.body.attributeType = e.oType, n.body.value = e.data, e.cType !== d.ChangeType.UPDATE && (n.body.operation = e.cType)), t && (n.to = t.path, n.body.resource = t.childId), r._bus.postMessage(n);
            }
          } }, { key: "_changeObject", value: function value(e, t) {
            var r = this;if (r._version + 1 === t.body.version) {
              r._version++;var n = t.body.attribute,
                  o = (0, v.deepClone)(t.body.value),
                  i = e.findBefore(n);if (t.body.attributeType === d.ObjectType.ARRAY) {
                if (t.body.operation === d.ChangeType.ADD) {
                  var s = i.obj,
                      a = i.last;Array.prototype.splice.apply(s, [a, 0].concat(o));
                } else if (t.body.operation === d.ChangeType.REMOVE) {
                  var c = i.obj,
                      u = i.last;c.splice(u, o);
                } else i.obj[i.last] = o;
              } else t.body.value ? i.obj[i.last] = o : delete i.obj[i.last];
            } else console.log("UNSYNCHRONIZED VERSION: (data => " + r._version + ", msg => " + t.body.version + ")");
          } }, { key: "_changeChildren", value: function value(e) {
            var t = this;console.log("Change children: ", t._owner, e);var r = e.body.resource,
                n = t._childrenObjects[r];n ? t._changeObject(n._syncObj, e) : console.log("No children found for: ", r);
          } }, { key: "url", get: function get() {
            return this._url;
          } }, { key: "schema", get: function get() {
            return this._schema;
          } }, { key: "status", get: function get() {
            return this._status;
          } }, { key: "data", get: function get() {
            return this._syncObj.data;
          } }, { key: "childrens", get: function get() {
            return this._childrenObjects;
          } }]), e;
      }();r["default"] = y, t.exports = r["default"];
    }, { "../utils/utils.js": 100, "./DataObjectChild": 94, "./SyncObject": 98, "babel-runtime/core-js/object/keys": 7, "babel-runtime/core-js/promise": 9, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12 }], 94: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/helpers/classCallCheck"),
          i = n(o),
          s = e("babel-runtime/helpers/createClass"),
          a = n(s),
          c = e("./SyncObject"),
          u = n(c),
          l = function () {
        function e(t, r, n, o, s) {
          (0, i["default"])(this, e);var a = this;a._parent = t, a._childId = r, a._owner = o, a._msgId = s, a._syncObj = new u["default"](n), a._bus = t._bus, a._allocateListeners();
        }return (0, a["default"])(e, [{ key: "_allocateListeners", value: function value() {
            var e = this;e._owner && (e._listener = e._bus.addListener(e._owner, function (t) {
              "response" === t.type && t.id === e._msgId && (console.log("DataObjectChild.onResponse:", t), e._onResponse(t));
            }));
          } }, { key: "_releaseListeners", value: function value() {
            var e = this;e._listener && e._listener.remove();
          } }, { key: "delete", value: function value() {
            var e = this;delete e._parent._children[e._childId], e._releaseListeners();
          } }, { key: "onChange", value: function value(e) {
            this._syncObj.observe(function (t) {
              e(t);
            });
          } }, { key: "onResponse", value: function value(e) {
            this._onResponseHandler = e;
          } }, { key: "_onResponse", value: function value(e) {
            var t = this,
                r = { type: e.type, url: e.body.source, code: e.body.code };t._onResponseHandler && t._onResponseHandler(r);
          } }, { key: "childId", get: function get() {
            return this._childId;
          } }, { key: "data", get: function get() {
            return this._syncObj.data;
          } }]), e;
      }();r["default"] = l, t.exports = r["default"];
    }, { "./SyncObject": 98, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12 }], 95: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/core-js/object/keys"),
          i = n(o),
          s = e("babel-runtime/core-js/object/get-prototype-of"),
          a = n(s),
          c = e("babel-runtime/helpers/classCallCheck"),
          u = n(c),
          l = e("babel-runtime/helpers/createClass"),
          f = n(l),
          d = e("babel-runtime/helpers/possibleConstructorReturn"),
          p = n(d),
          b = e("babel-runtime/helpers/get"),
          h = n(b),
          v = e("babel-runtime/helpers/inherits"),
          y = n(v),
          _ = e("./DataObject"),
          g = n(_),
          m = e("./DataObjectChild"),
          j = n(m),
          $ = { ANY: "any", START: "start", EXACT: "exact" },
          O = function (e) {
        function t(e, r, n, o, s, c, l) {
          (0, u["default"])(this, t);var f = (0, p["default"])(this, (0, a["default"])(t).call(this, e, r, n, o, s.data, c)),
              d = f;return d._version = l, d._filters = {}, d._syncObj.observe(function (e) {
            d._onFilter(e);
          }), (0, i["default"])(s.childrens).forEach(function (e) {
            var t = s.childrens[e];d._childrenObjects[e] = new j["default"](d, e, t);
          }), d._allocateListeners(), f;
        }return (0, y["default"])(t, e), (0, f["default"])(t, [{ key: "_allocateListeners", value: function value() {
            (0, h["default"])((0, a["default"])(t.prototype), "_allocateListeners", this).call(this);var e = this;e._changeListener = e._bus.addListener(e._url + "/changes", function (t) {
              "update" === t.type && (console.log("DataObjectObserver-" + e._url + "-RCV: ", t), e._changeObject(e._syncObj, t));
            });
          } }, { key: "_releaseListeners", value: function value() {
            (0, h["default"])((0, a["default"])(t.prototype), "_releaseListeners", this).call(this);var e = this;e._changeListener.remove();
          } }, { key: "delete", value: function value() {
            var e = this;e._releaseListeners(), delete e._syncher._observers[e._url];
          } }, { key: "unsubscribe", value: function value() {
            var e = this,
                t = { type: "unsubscribe", from: e._owner, to: e._syncher._subURL, body: { resource: e._url } };e._bus.postMessage(t, function (t) {
              console.log("DataObjectObserver-UNSUBSCRIBE: ", t), 200 === t.body.code && (e._releaseListeners(), delete e._syncher._observers[e._url]);
            });
          } }, { key: "onChange", value: function value(e, t) {
            var r = e,
                n = { type: $.EXACT, callback: t },
                o = e.indexOf("*");o === e.length - 1 && (0 === o ? n.type = $.ANY : (n.type = $.START, r = e.substr(0, e.length - 1))), this._filters[r] = n;
          } }, { key: "_onFilter", value: function value(e) {
            var t = this;(0, i["default"])(t._filters).forEach(function (r) {
              var n = t._filters[r];n.type === $.ANY ? n.callback(e) : n.type === $.START ? 0 === e.field.indexOf(r) && n.callback(e) : n.type === $.EXACT && e.field === r && n.callback(e);
            });
          } }]), t;
      }(g["default"]);r["default"] = O, t.exports = r["default"];
    }, { "./DataObject": 93, "./DataObjectChild": 94, "babel-runtime/core-js/object/get-prototype-of": 6, "babel-runtime/core-js/object/keys": 7, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12, "babel-runtime/helpers/get": 13, "babel-runtime/helpers/inherits": 14, "babel-runtime/helpers/possibleConstructorReturn": 15 }], 96: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/core-js/object/keys"),
          i = n(o),
          s = e("babel-runtime/core-js/object/get-prototype-of"),
          a = n(s),
          c = e("babel-runtime/helpers/classCallCheck"),
          u = n(c),
          l = e("babel-runtime/helpers/createClass"),
          f = n(l),
          d = e("babel-runtime/helpers/possibleConstructorReturn"),
          p = n(d),
          b = e("babel-runtime/helpers/get"),
          h = n(b),
          v = e("babel-runtime/helpers/inherits"),
          y = n(v),
          _ = e("./DataObject"),
          g = n(_),
          m = e("../utils/utils.js"),
          j = function (e) {
        function t(e, r, n, o, i, s) {
          (0, u["default"])(this, t);var c = (0, p["default"])(this, (0, a["default"])(t).call(this, e, r, n, o, i, s)),
              l = c;return l._subscriptions = {}, l._syncObj.observe(function (e) {
            console.log("DataObjectReporter-" + r + "-SEND: ", e), l._onChange(e);
          }), l._allocateListeners(), c;
        }return (0, y["default"])(t, e), (0, f["default"])(t, [{ key: "_allocateListeners", value: function value() {
            (0, h["default"])((0, a["default"])(t.prototype), "_allocateListeners", this).call(this);var e = this;e._responseListener = e._bus.addListener(e._url, function (t) {
              "response" === t.type && e._onResponse(t);
            });
          } }, { key: "_releaseListeners", value: function value() {
            (0, h["default"])((0, a["default"])(t.prototype), "_releaseListeners", this).call(this);var e = this;e._responseListener.remove();
          } }, { key: "inviteObservers", value: function value(e) {
            var t = this,
                r = { type: "create", from: t._syncher._owner, to: t._syncher._subURL, body: { resource: t._url, schema: t._schema, value: t._syncObj.data, authorise: e } };t._bus.postMessage(r);
          } }, { key: "delete", value: function value() {
            var e = this,
                t = { type: "delete", from: e._owner, to: e._syncher._subURL, body: { resource: e._url } };e._bus.postMessage(t, function (t) {
              console.log("DataObjectReporter-DELETE: ", t), 200 === t.body.code && (e._releaseListeners(), delete e._syncher._reporters[e._url]);
            });
          } }, { key: "onSubscription", value: function value(e) {
            this._onSubscriptionHandler = e;
          } }, { key: "onResponse", value: function value(e) {
            this._onResponseHandler = e;
          } }, { key: "_onForward", value: function value(e) {
            var t = this;switch (console.log("DataObjectReporter-RCV: ", e), e.body.type) {case "subscribe":
                t._onSubscribe(e);break;case "unsubscribe":
                t._onUnSubscribe(e);}
          } }, { key: "_onSubscribe", value: function value(e) {
            var t = this,
                r = e.body.from,
                n = { type: e.body.type, url: r, accept: function accept() {
                var n = { url: r, status: "on" };t._subscriptions[r] = n;var o = {};return (0, i["default"])(t._childrenObjects).forEach(function (e) {
                  var r = t._childrenObjects[e].data;o[e] = (0, m.deepClone)(r);
                }), t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: 200, schema: t._schema, version: t._version, value: { data: (0, m.deepClone)(t.data), childrens: o } } }), n;
              }, reject: function reject(r) {
                t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: 403, desc: r } });
              } };t._onSubscriptionHandler && (console.log("SUBSCRIPTION-EVENT: ", n), t._onSubscriptionHandler(n));
          } }, { key: "_onUnSubscribe", value: function value(e) {
            var t = this,
                r = e.body.from,
                n = t._subscriptions[r];delete t._subscriptions[r];var o = { type: e.body.type, url: r, object: n };t._onSubscriptionHandler && (console.log("UN-SUBSCRIPTION-EVENT: ", o), t._onSubscriptionHandler(o));
          } }, { key: "_onResponse", value: function value(e) {
            var t = this,
                r = { type: e.type, url: e.from, code: e.body.code };t._onResponseHandler && (console.log("RESPONSE-EVENT: ", r), t._onResponseHandler(r));
          } }, { key: "subscriptions", get: function get() {
            return this._subscriptions;
          } }]), t;
      }(g["default"]);r["default"] = j, t.exports = r["default"];
    }, { "../utils/utils.js": 100, "./DataObject": 93, "babel-runtime/core-js/object/get-prototype-of": 6, "babel-runtime/core-js/object/keys": 7, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12, "babel-runtime/helpers/get": 13, "babel-runtime/helpers/inherits": 14, "babel-runtime/helpers/possibleConstructorReturn": 15 }], 97: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/helpers/classCallCheck"),
          i = n(o),
          s = e("babel-runtime/helpers/createClass"),
          a = n(s),
          c = function () {
        function e(t, r, n, o) {
          (0, i["default"])(this, e);var s = this;s._owner = t, s._url = r, s._bus = n, s._children = o, s._changes = [], s._allocateListeners();
        }return (0, a["default"])(e, [{ key: "_allocateListeners", value: function value() {
            var e = this;e._listener = e._bus.addListener(e._url, function (t) {
              console.log("DataProvisional-" + e._url + "-RCV: ", t), e._changes.push(t);
            });
          } }, { key: "_releaseListeners", value: function value() {
            var e = this;e._listener.remove();
          } }, { key: "apply", value: function value(e) {
            var t = this;t._changes.forEach(function (t) {
              e._changeObject(e._syncObj, t);
            });
          } }, { key: "children", get: function get() {
            return this._children;
          } }]), e;
      }();r["default"] = c, t.exports = r["default"];
    }, { "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12 }], 98: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 }), r.ObjectType = r.ChangeType = void 0;var o = e("babel-runtime/core-js/object/keys"),
          i = n(o),
          s = e("babel-runtime/helpers/classCallCheck"),
          a = n(s),
          c = e("babel-runtime/helpers/createClass"),
          u = n(c),
          l = e("../utils/utils.js"),
          f = function () {
        function e(t) {
          (0, a["default"])(this, e);var r = this;r._observers = [], r._filters = {}, t ? r._data = (0, l.deepClone)(t) : r._data = {}, r._internalObserve(new d(), r._data);
        }return (0, u["default"])(e, [{ key: "observe", value: function value(e) {
            this._observers.push(e);
          } }, { key: "find", value: function value(e) {
            var t = e.split(".");return this._findWithSplit(t);
          } }, { key: "findBefore", value: function value(e) {
            var t = {},
                r = e.split(".");return t.last = r.pop(), t.obj = this._findWithSplit(r), t;
          } }, { key: "_findWithSplit", value: function value(e) {
            var t = this._data;return e.forEach(function (e) {
              t = t[e];
            }), t;
          } }, { key: "_fireEvent", value: function value(e) {
            this._observers.forEach(function (t) {
              t(e);
            });
          } }, { key: "_isObservable", value: function value(e) {
            return e.constructor === Object || e.constructor === Array;
          } }, { key: "_internalObserve", value: function value(e, t) {
            var r = this;if (r._isObservable(t)) {
              var n = function n(t) {
                r._onChanges(e, t);
              };if (t.constructor === Object) {
                Object.observe(t, n);for (var o in t) {
                  r._isObservable(t[o]) && r._internalObserve(e["new"](o), t[o]);
                }
              } else if (t.constructor === Array) {
                Array.observe(t, n);for (var i in t) {
                  if (r._isObservable(t[i])) {
                    var s = e["new"](new p(t[i], i));r._internalObserve(s, t[i]);
                  }
                }
              }
            }
          } }, { key: "_onChanges", value: function value(e, t) {
            var r = this;for (var n in t) {
              var o = t[n].object,
                  i = void 0;if (o.constructor === Object && (i = h.OBJECT), o.constructor === Array && (i = h.ARRAY), "splice" === t[n].type) !function () {
                var s = t[n].index,
                    a = e["new"]("" + s),
                    c = a.toString(),
                    u = t[n].removed.length;if (0 !== u) {
                  var f = t[n].removed;f.forEach(function (t, n) {
                    r._isObservable(t) && e.removeIndex(s + n);
                  }), r._fireEvent({ cType: b.REMOVE, oType: i, field: c, data: u });
                }var d = t[n].addedCount;if (0 !== d) {
                  var h = o.slice(s, s + d);h.forEach(function (t, n) {
                    if (r._isObservable(t)) {
                      var o = e["new"](new p(t, s + n));r._internalObserve(o, t);
                    }
                  }), r._fireEvent({ cType: b.ADD, oType: i, field: c, data: (0, l.deepClone)(h) });
                }s !== o.length - 1 && e.reIndexFrom(o);
              }();else {
                var s = e["new"](t[n].name),
                    a = s.toString();if (-1 !== a.indexOf("Symbol")) continue;var c = o[t[n].name];"update" === t[n].type && this._fireEvent({ cType: b.UPDATE, oType: i, field: a, data: (0, l.deepClone)(c) }), "add" === t[n].type && (this._internalObserve(s, c), this._fireEvent({ cType: b.ADD, oType: i, field: a, data: (0, l.deepClone)(c) })), "delete" === t[n].type && this._fireEvent({ cType: b.REMOVE, oType: i, field: a });
              }
            }
          } }, { key: "data", get: function get() {
            return this._data;
          } }]), e;
      }(),
          d = function () {
        function e() {
          (0, a["default"])(this, e), this._path = [], this._observables = {};
        }return (0, u["default"])(e, [{ key: "removeIndex", value: function value(e) {
            delete this._observables[e];
          } }, { key: "reIndexFrom", value: function value(e) {
            var t = this;(0, i["default"])(this._observables).forEach(function (r) {
              var n = t._observables[r],
                  o = e.indexOf(n.obj);n.idx != o && (n.idx = o, delete t._observables[r], t._observables[o] = n);
            });
          } }, { key: "new", value: function value(e) {
            e.constructor == p && (this._observables[e.idx] = e);var t = this.clone();return t._path.push(e), t;
          } }, { key: "clone", value: function value() {
            var t = new e();return this._path.forEach(function (e) {
              t._path.push(e);
            }), t;
          } }, { key: "toString", value: function value() {
            var e = "";return this._path.forEach(function (t, r) {
              0 === r ? e = t.toString() : e += "." + t.toString();
            }), e;
          } }]), e;
      }(),
          p = function () {
        function e(t, r) {
          (0, a["default"])(this, e), this.obj = t, this.idx = r;
        }return (0, u["default"])(e, [{ key: "toString", value: function value() {
            return this.idx.toString();
          } }]), e;
      }(),
          b = r.ChangeType = { UPDATE: "update", ADD: "add", REMOVE: "remove" },
          h = r.ObjectType = { OBJECT: "object", ARRAY: "array" };r["default"] = f;
    }, { "../utils/utils.js": 100, "babel-runtime/core-js/object/keys": 7, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12 }], 99: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }Object.defineProperty(r, "__esModule", { value: !0 });var o = e("babel-runtime/core-js/promise"),
          i = n(o),
          s = e("babel-runtime/helpers/classCallCheck"),
          a = n(s),
          c = e("babel-runtime/helpers/createClass"),
          u = n(c),
          l = e("./DataObjectReporter"),
          f = n(l),
          d = e("./DataObjectObserver"),
          p = n(d),
          b = e("./DataProvisional"),
          h = n(b),
          v = function () {
        function e(t, r, n) {
          (0, a["default"])(this, e);var o = this;o._owner = t, o._bus = r, o._subURL = n.runtimeURL + "/sm", o._reporters = {}, o._observers = {}, o._provisionals = {}, r.addListener(t, function (e) {
            if (e.from !== t) switch (console.log("Syncher-RCV: ", e), e.type) {case "forward":
                o._onForward(e);break;case "create":
                o._onRemoteCreate(e);break;case "delete":
                o._onRemoteDelete(e);}
          });
        }return (0, u["default"])(e, [{ key: "create", value: function value(e, t, r) {
            var n = this;r.reporter = n._owner, r.schema = e;var o = { type: "create", from: n._owner, to: n._subURL, body: { schema: e, value: r, authorise: t } };return new i["default"](function (t, i) {
              n._bus.postMessage(o, function (o) {
                if (console.log("create-response: ", o), 200 === o.body.code) {
                  var s = o.body.resource,
                      a = new f["default"](n, s, e, "on", r, o.body.childrenResources);n._reporters[s] = a, t(a);
                } else i(o.body.desc);
              });
            });
          } }, { key: "subscribe", value: function value(e, t) {
            var r = this,
                n = { type: "subscribe", from: r._owner, to: r._subURL, body: { schema: e, resource: t } };return new i["default"](function (o, i) {
              r._bus.postMessage(n, function (n) {
                console.log("subscribe-response: ", n);var s = r._provisionals[t];if (delete r._provisionals[t], s && s._releaseListeners(), n.body.code < 200) s = new h["default"](r._owner, t, r._bus, n.body.childrenResources), r._provisionals[t] = s;else if (200 === n.body.code) {
                  var a = new p["default"](r, t, e, "on", n.body.value, s.children, n.body.version);r._observers[t] = a, o(a), s.apply(a);
                } else i(n.body.desc);
              });
            });
          } }, { key: "onNotification", value: function value(e) {
            this._onNotificationHandler = e;
          } }, { key: "_onForward", value: function value(e) {
            var t = this,
                r = t._reporters[e.body.to];r._onForward(e);
          } }, { key: "_onRemoteCreate", value: function value(e) {
            var t = this,
                r = e.from.slice(0, -13),
                n = { type: e.type, from: e.body.source, url: r, schema: e.body.schema, value: e.body.value, identity: e.body.identity, ack: function ack(r) {
                var n = 200;r && (n = r), t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: n } });
              } };t._onNotificationHandler && (console.log("NOTIFICATION-EVENT: ", n), t._onNotificationHandler(n));
          } }, { key: "_onRemoteDelete", value: function value(e) {
            var t = this,
                r = e.body.resource,
                n = t._observers[r];if (n) {
              var o = { type: e.type, url: r, identity: e.body.identity, ack: function ack(r) {
                  var o = 200;r && (o = r), 200 === o && n["delete"](), t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: o, source: t._owner } });
                } };t._onNotificationHandler && (console.log("NOTIFICATION-EVENT: ", o), t._onNotificationHandler(o));
            } else t._bus.postMessage({ id: e.id, type: "response", from: e.to, to: e.from, body: { code: 404, source: t._owner } });
          } }, { key: "owner", get: function get() {
            return this._owner;
          } }, { key: "reporters", get: function get() {
            return this._reporters;
          } }, { key: "observers", get: function get() {
            return this._observers;
          } }]), e;
      }();r["default"] = v, t.exports = r["default"];
    }, { "./DataObjectObserver": 95, "./DataObjectReporter": 96, "./DataProvisional": 97, "babel-runtime/core-js/promise": 9, "babel-runtime/helpers/classCallCheck": 11, "babel-runtime/helpers/createClass": 12 }], 100: [function (e, t, r) {
      "use strict";
      function n(e) {
        return e && e.__esModule ? e : { "default": e };
      }function o(e) {
        var t = /([a-zA-Z-]*):\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi,
            r = "$1,$2,$3",
            n = e.replace(t, r).split(",");n[0] === e && (n[0] = "https", n[1] = e);var o = { type: n[0], domain: n[1], identity: n[2] };return o;
      }function i(e) {
        return e ? JSON.parse((0, a["default"])(e)) : void 0;
      }Object.defineProperty(r, "__esModule", { value: !0 });var s = e("babel-runtime/core-js/json/stringify"),
          a = n(s);r.divideURL = o, r.deepClone = i;
    }, { "babel-runtime/core-js/json/stringify": 2 }] }, {}, [92])(92);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = activate;

var _HypertyDiscovery = require('service-framework/dist/HypertyDiscovery');

var _HypertyDiscovery2 = _interopRequireDefault(_HypertyDiscovery);

var _Syncher = require('service-framework/dist/Syncher');

var _IdentityManager = require('./utils/IdentityManager.js');

var _IdentityManager2 = _interopRequireDefault(_IdentityManager);

var _EventEmitter2 = require('./utils/EventEmitter.js');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _utils = require('./utils/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 PT Inovação e Sistemas SA
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 INESC-ID
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 QUOBIS NETWORKS SL
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 ORANGE SA
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 Deutsche Telekom AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 Apizee
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               **/

// Service Framework


// Utils


var status = {
  name: 'status',
  status: 'disconnected'
};

/**
* Hyperty Presence;
* @author Apizee [dev@apizee.com]
* @version 0.1.0
*/

var UserStatus = function (_EventEmitter) {
  _inherits(UserStatus, _EventEmitter);

  function UserStatus(hypertyURL, bus, configuration) {
    _classCallCheck(this, UserStatus);

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UserStatus).call(this, hypertyURL, bus, configuration));

    var domain = (0, _utils.divideURL)(hypertyURL).domain;

    _this._syncher = new _Syncher.Syncher(hypertyURL, bus, configuration);

    _this._hypertyDiscovery = new _HypertyDiscovery2.default(hypertyURL, bus);

    _this._identityManager = new _IdentityManager2.default(hypertyURL, configuration.runtimeURL, bus);

    _this._objectDescURL = 'hyperty-catalogue://' + domain + '/.well-known/dataschema/UserStatusDataSchema';

    _this._hypertyURL = hypertyURL;
    _this._domain = domain;

    _this._heartbeat = [];

    _this._syncher.onNotification(function (event) {
      _this._onNotification(event);
    });

    return _this;
  }

  _createClass(UserStatus, [{
    key: '_onNotification',
    value: function _onNotification(event) {
      var _this2 = this;

      console.info('UserStatus Event Received: ', event);

      event.ack();

      // if (event.schema === this._objectDescURL) {
      // Subscribe to user status presence
      this._syncher.subscribe(this._objectDescURL, event.url).then(function (statusObjectObserver) {
        console.info('-------- Status Observer received ---------', statusObjectObserver);

        _this2.trigger('statusChange', {
          identity: event.identity,
          status: statusObjectObserver.data.status
        });

        _this2._managePresenceHeartbeat(event.identity);

        statusObjectObserver.onChange('*', function () {
          console.info('status event received:', event);
          _this2.trigger('statusChange', {
            identity: event.identity,
            status: statusObjectObserver.data.status
          });
          _this2._managePresenceHeartbeat(event.identity);
        });

        console.log(event.identity.email, 'has subscribe to my status data object, send invite to listen mine');
        _this2._statusObjectReporter.inviteObservers([event.from]);
      }).catch(function (reason) {
        console.error(reason);
      });
      // }
    }

    /**
     * This function is used to create a new status object syncher
     * @param  {URL.UserURL} participants List of User allowed
     * @return {Promise}
     */

  }, {
    key: 'create',
    value: function create(participants) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {

        status.status = 'connected';
        status.owner = _this3._hypertyURL;
        status.name = 'presence';

        console.info('----------------------- Mapping Particpants --------------------');
        _this3._mappingUser(participants).then(function (hyperties) {
          console.debug('After mapping here are hypeties: ', hyperties);
          return _this3.createSyncher(hyperties, status);
        }).then(function (statusObjectReporter) {
          _this3._statusObjectReporter = statusObjectReporter;
          _this3._statusObjectReporter.onSubscription(function (event) {
            console.info('-------- Status Reporter received subscription request ---------', event);
            event.accept();
          });
          setInterval(function () {
            _this3._sendHeartbeat();
          }, 50000);
        }).catch(function (reason) {
          reject(reason);
        });
      });
    }
  }, {
    key: 'createSyncher',
    value: function createSyncher(hyperties, status) {
      console.info('------------------------ Syncher Create ----------------------', hyperties, status);
      return this._syncher.create(this._objectDescURL, hyperties, status);
    }
  }, {
    key: 'join',
    value: function join(resource) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {

        console.info('------------------------ Syncher subscribe ----------------------');

        _this4._syncher.subscribe(_this4._objectDescURL, resource).then(function (dataObjectObserver) {
          console.info('Data Object Observer: ', dataObjectObserver);
        }).catch(function (reason) {
          reject(reason);
        });
      });
    }
  }, {
    key: 'setStatus',
    value: function setStatus(newStatus) {
      console.log('change status to', newStatus);
      this._statusObjectReporter.data.status = newStatus;
    }

    /**
     * Update status object date
     */

  }, {
    key: '_sendHeartbeat',
    value: function _sendHeartbeat() {
      console.log('send heartbeat');
      this._statusObjectReporter.data.date = new Date().getTime();
    }

    /**
     * Monitor user activity within heartbeat timeout period
     */

  }, {
    key: '_managePresenceHeartbeat',
    value: function _managePresenceHeartbeat(identity) {
      var _this5 = this;

      console.log('renew heartbeat period for', identity);
      var email = identity.email;
      if (email in this._heartbeat) {
        clearTimeout(this._heartbeat[email]);
      }
      this._heartbeat[email] = setTimeout(function () {
        console.log(email, 'has disconnect');
        clearTimeout(_this5._heartbeat[email]);
        _this5.trigger('statusChange', {
          identity: identity,
          status: 'disconnected'
        });
      }, 60000);
    }
  }, {
    key: '_mappingUser',
    value: function _mappingUser(userList) {
      var _this6 = this;

      console.info('------------------------ _mappingUser ----------------------', userList);

      return new Promise(function (resolve, reject) {
        var hyperties = [];
        var count = 0;

        if (userList.length === 0) reject(hyperties);

        var resultUsers = function resultUsers() {
          if (count === userList.length) {
            console.info('Have ' + hyperties.length + 'users found;');
            resolve(hyperties);
          }
        };

        var activeUsers = function activeUsers(user) {
          count++;
          hyperties.push(user.hypertyURL);
          resultUsers();
        };

        var inactiveUsers = function inactiveUsers() {
          count++;
          resultUsers();
        };

        userList.forEach(function (user) {
          console.log(user);
          if (user.email.length) {
            console.info('------------------------  userList.forEach( _mappingUser ----------------------', userList);
            return _this6._hypertyDiscovery.discoverHypertyPerUser(user.email, user.domain).then(activeUsers).catch(inactiveUsers);
          }
        });
      });
    }
  }]);

  return UserStatus;
}(_EventEmitter3.default);

function activate(hypertyURL, bus, configuration) {

  return {
    name: 'UserStatus',
    instance: new UserStatus(hypertyURL, bus, configuration)
  };
}

},{"./utils/EventEmitter.js":5,"./utils/IdentityManager.js":6,"./utils/utils.js":7,"service-framework/dist/HypertyDiscovery":2,"service-framework/dist/Syncher":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

/**
 * EventEmitter
 * All classes which extends this, can have addEventListener and trigger events;
 */

var EventEmitter = function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);
  }

  _createClass(EventEmitter, [{
    key: "addEventListener",


    /**
     * addEventListener listen for an eventType
     * @param  {string}         eventType - listening for this type of event
     * @param  {Function}       cb        - callback function will be executed when the event it is invoked
     */
    value: function addEventListener(eventType, cb) {
      var _this = this;
      _this[eventType] = cb;
    }

    /**
     * Invoke the eventType
     * @param  {string} eventType - event will be invoked
     * @param  {object} params - parameters will be passed to the addEventListener
     */

  }, {
    key: "trigger",
    value: function trigger(eventType, params) {
      var _this = this;

      if (_this[eventType]) {
        _this[eventType](params);
      }
    }
  }]);

  return EventEmitter;
}();

exports.default = EventEmitter;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 PT Inovação e Sistemas SA
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 INESC-ID
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 QUOBIS NETWORKS SL
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 ORANGE SA
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 Deutsche Telekom AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 Apizee
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     **/


var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Core IdentityManager interface
* Class to allow applications to search for Identities registered in runtime-core
*/

var IdentityManager = function () {

  /**
  * To initialise the IdentityManager, which will provide the support for hyperties to
  * query about identities registered
  * @param  {String}          hypertyURL            hypertyURL
  * @param  {String}          runtimeURL            runtimeURL
  * @param  {MessageBus}          msgbus                msgbus
  */

  function IdentityManager(hypertyURL, runtimeURL, msgBus) {
    _classCallCheck(this, IdentityManager);

    var _this = this;
    _this.messageBus = msgBus;

    _this.domain = (0, _utils.divideURL)(hypertyURL).domain;
    _this.hypertyURL = hypertyURL;
    _this.runtimeURL = runtimeURL;
  }

  /**
  * Function to query the runtime registry about the identity to which the hyperty was associated
  * @param {String}       hypertyURL   (Optional)
  * @return {Promise}     userURL       userURL associated to the hyperty
  */


  _createClass(IdentityManager, [{
    key: 'discoverUserRegistered',
    value: function discoverUserRegistered(hypertyURL) {
      var _this = this;
      var activeDomain = void 0;
      var activeHypertyURL = void 0;

      if (!hypertyURL) {
        activeHypertyURL = _this.hypertyURL;
      } else {
        activeHypertyURL = hypertyURL;
      }

      var msg = {
        type: 'read', from: activeHypertyURL, to: _this.runtimeURL + '/registry/', body: { resource: '.', criteria: activeHypertyURL }
      };

      return new Promise(function (resolve, reject) {

        _this.messageBus.postMessage(msg, function (reply) {

          var userURL = reply.body.resource;
          if (userURL) {
            resolve(userURL);
          } else {
            reject('No user was not found');
          }
        });
      });
    }
  }]);

  return IdentityManager;
}();

exports.default = IdentityManager;

},{"./utils":7}],7:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.divideURL = divideURL;
exports.deepClone = deepClone;
exports.getConfig = getConfig;
exports.getUserMedia = getUserMedia;
exports.serialize = serialize;
exports.getTemplate = getTemplate;
/**
 * Copyright 2016 PT Inovação e Sistemas SA
 * Copyright 2016 INESC-ID
 * Copyright 2016 QUOBIS NETWORKS SL
 * Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
 * Copyright 2016 ORANGE SA
 * Copyright 2016 Deutsche Telekom AG
 * Copyright 2016 Apizee
 * Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// jshint browser:true, jquery: true
// jshint varstmt: true
/* global Handlebars */

/**
 * Support module with some functions will be useful
 * @module utils
 */

/**
 * @typedef divideURL
 * @type Object
 * @property {string} type The type of URL
 * @property {string} domain The domain of URL
 * @property {string} identity The identity of URL
 */

/**
 * Divide an url in type, domain and identity
 * @param  {URL.URL} url - url address
 * @return {divideURL} the result of divideURL
 */
function divideURL(url) {

  // let re = /([a-zA-Z-]*)?:\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi;
  var re = /([a-zA-Z-]*):\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi;
  var subst = '$1,$2,$3';
  var parts = url.replace(re, subst).split(',');

  // If the url has no protocol, the default protocol set is https
  if (parts[0] === url) {
    parts[0] = 'https';
    parts[1] = url;
  }

  var result = {
    type: parts[0],
    domain: parts[1],
    identity: parts[2]
  };

  return result;
}

/**
 * Make a COPY of the original data
 * @param  {Object}  obj - object to be cloned
 * @return {Object}
 */
function deepClone(obj) {
  //TODO: simple but inefficient JSON deep clone...
  if (obj) return JSON.parse(JSON.stringify(obj));
}

/**
 * Get the configuration from an json file;
 * @param  {JSONObject} jsonFile
 * @return {object}
 */
function getConfig(JSONObject) {
  console.log(process.env.environment);
  return JSONObject[process.env.environment];
}

/**
 * Get WebRTC API resources
 * @param  {Object}     options Object containing the information that resources will be used (camera, mic, resolution, etc);
 * @return {Promise}
 */
function getUserMedia(constraints) {

  return new Promise(function (resolve, reject) {

    navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
      resolve(mediaStream);
    }).catch(function (reason) {
      reject(reason);
    });
  });
}

function serialize() {

  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }

        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });

    return o;
  };

  $.fn.serializeObjectArray = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }

        o[this.name].push(this.value || '');
      } else {
        if (!o[this.name]) o[this.name] = [];
        o[this.name].push(this.value || '');
      }
    });

    return o;
  };
}

function getTemplate(path, script) {

  return new Promise(function (resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    var templateFile = $.ajax({
      url: path + '.hbs',
      success: function success(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
      },

      fail: function fail(reason) {
        return reason;
      }
    });

    var scriptFile = $.getScript(script);

    var requests = [];
    if (path) requests.push(templateFile);
    if (script) requests.push(scriptFile);

    Promise.all(requests).then(function (result) {
      resolve(Handlebars.templates[name]);
    }).catch(function (reason) {
      reject(reason);
    });
  });
}

}).call(this,require('_process'))
},{"_process":1}]},{},[4])(4)
});