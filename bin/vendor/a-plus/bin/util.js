(function(){
  var AllDoneWaiter, rem, pxToRem, remToPx, convertToPx, colorLuminance;
  String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  String.prototype.camelize = function(isFirstUppercase){
    isFirstUppercase == null && (isFirstUppercase = false);
    return this.split('-').map(function(token, index){
      if (index === 0 && !isFirstUppercase) {
        return token;
      } else {
        return token.capitalize();
      }
    }).join('');
  };
  String.prototype.contains = function(substr){
    return this.indexOf(substr) > -1;
  };
  Array.prototype.anyContains = function(str){
    var i$, len$, e;
    for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
      e = this[i$];
      if (typeof e === 'string' && e.contains(str)) {
        return true;
      }
    }
    return false;
  };
  Array.prototype.next = function(){
    var index;
    index = 0;
    return function(){
      return this[index++ % this.length];
    };
  }();
  Array.prototype.findIndex = function(obj){
    var i$, len$, i, element;
    for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
      i = i$;
      element = this[i$];
      if (obj === element) {
        return i;
      }
    }
    return null;
  };
  Function.prototype.decorate = function(arg$){
    var before, after, isPassingArguments;
    before = arg$.before, after = arg$.after, isPassingArguments = arg$.isPassingArguments;
    return (function(b, a, self){
      if (isPassingArguments) {
        return function(){
          var bR, sR, aR;
          bR = typeof b === 'function' ? b.apply(this, arguments) : void 8;
          sR = bR
            ? self(bR)
            : self.apply(this, arguments);
          return aR = (typeof a === 'function' ? a(sR) : void 8) || sR;
        };
      } else {
        return function(){
          if (typeof b === 'function') {
            b.apply(this, arguments);
          }
          self.apply(this, arguments);
          return typeof a === 'function' ? a.apply(this, arguments) : void 8;
        };
      }
    }.call(this, before, after, this));
  };
  Function.once = function(fn){
    var isCalled;
    isCalled = false;
    return function(){
      if (!isCalled) {
        return isCalled = true, fn.apply(this, arguments);
      }
    };
  };
  /*
    @Description: 异步处理
    @Author: Wangqing
    @Date: 2014/10/4
    @Version: 0.0.2
   */
  AllDoneWaiter = (function(){
    AllDoneWaiter.displayName = 'AllDoneWaiter';
    var prototype = AllDoneWaiter.prototype, constructor = AllDoneWaiter;
    AllDoneWaiter.allComplete = function(collection, fnName, done){
      var waiter, waiters, key, element;
      if (Array.isArray(collection) && collection.length === 0) {
        return done();
      }
      waiter = new this(done);
      waiters = {};
      for (key in collection) {
        element = collection[key];
        if (collection.hasOwnProperty(key)) {
          waiters[key] = waiter.addWaitingFunction();
        }
      }
      for (key in collection) {
        element = collection[key];
        if (typeof element[fnName] === 'function') {
          element[fnName](waiters[key]);
        }
      }
    };
    AllDoneWaiter.getLogFuntion = function(element, done){};
    AllDoneWaiter.allDoneOneByOne = function(collection, fnName, done){
      var fn, i$, ref$, len$, element;
      fn = done;
      for (i$ = 0, len$ = (ref$ = collection.reverse()).length; i$ < len$; ++i$) {
        element = ref$[i$];
        (fn$.call(this, fn, element));
      }
      fn();
      function fn$(f, element){
        fn = function(){
          if (typeof element[fnName] === 'function') {
            element[fnName](f);
          }
        };
      }
    };
    function AllDoneWaiter(done){
      this.done = done;
      this.count = 0;
    }
    prototype.addWaitingFunction = function(fn){
      var newFn, this$ = this;
      fn || (fn = function(){
        return 1 + 1;
      });
      this.count += 1;
      newFn = function(){
        fn.apply(null, arguments);
        this$.count -= 1;
        this$.check();
      };
      return newFn;
    };
    prototype.check = function(){
      if (this.count === 0) {
        this.done();
      }
    };
    return AllDoneWaiter;
  }());
  rem = function(){
    return parseInt(window.getComputedStyle(document.documentElement).fontSize);
  };
  pxToRem = function(px){
    return parseInt(px) / rem();
  };
  remToPx = function(_rem){
    return _rem * rem();
  };
  convertToPx = function(str){
    var ref$, all, numberStr, unit;
    ref$ = str.match(/([0-9.]+)([^0-9.]+)/), all = ref$[0], numberStr = ref$[1], unit = ref$[2];
    switch (false) {
    case unit !== 'px':
      return parseInt(numberStr);
    case unit !== 'rem':
      return remToPx(parseFloat(numberStr));
    default:
      return NaN;
    }
  };
  colorLuminance = function(hex, lum){
    var rgb, c, i;
    hex = String(hex).replace(/[^0-9a-f]/g, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    rgb = "#";
    c = undefined;
    i = undefined;
    i = 0;
    while (i < 3) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
      i++;
    }
    return rgb;
  };
  define(function(require, exports, module){
    var $, jquery, jqueryDebounce, eventProxy;
    $ = require('jquery');
    jquery = require('jquery.cookie');
    jqueryDebounce = require('jquery-debounce');
    eventProxy = $(document);
    return {
      rem: rem,
      convertToPx: convertToPx,
      pxToRem: pxToRem,
      remToPx: remToPx,
      colorLuminance: colorLuminance,
      debounce: $.debounce,
      throttle: $.throttle,
      getRealTextSize: function(chineseEnglishText){
        return chineseEnglishText.replace(/[^\x00-\xff]/g, "**").length;
      },
      events: {
        on: function(){
          return eventProxy.on.apply(eventProxy, arguments);
        },
        trigger: function(){
          return eventProxy.trigger.apply(eventProxy, arguments);
        }
      },
      hostPage: {
        on: function(hostPageMessageType, handler){
          $(window).on('message', function(event){
            if (event.originalEvent.data.type === hostPageMessageType) {
              handler(event);
            }
          });
        },
        trigger: function(hostPageMessageType, data){
          var targetDomain;
          data == null && (data = {});
          window.parent.postMessage(import$({
            type: hostPageMessageType
          }, data), targetDomain = '*');
        }
      },
      isNumber: function(numberOrStr){
        return !isNaN(numberOrStr);
      },
      AllDoneWaiter: AllDoneWaiter,
      getRandomKey: function(){
        return '' + Date.now() + Math.random();
      },
      getKeyOfValue: function(obj, value){
        var i$, ref$, len$, key;
        for (i$ = 0, len$ = (ref$ = Object.keys(obj)).length; i$ < len$; ++i$) {
          key = ref$[i$];
          if (obj[key] === value) {
            return key;
          }
        }
        return null;
      }
    };
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
