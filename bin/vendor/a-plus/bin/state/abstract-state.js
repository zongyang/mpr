(function(){
  define(function(require, exports, module){
    var AbstractState;
    return AbstractState = (function(){
      AbstractState.displayName = 'AbstractState';
      var util, prototype = AbstractState.prototype, constructor = AbstractState;
      util = require('util');
      function AbstractState(name, $default, legalValues){
        this.name = name;
        this['default'] = $default;
        this.legalValues = legalValues != null ? legalValues : 'any';
        if (typeof this['default'] !== 'undefined') {
          this.value = this['default'];
        }
        this.makeStateChangingDelaiable();
      }
      prototype.createObservable = function(check){
        var this$ = this;
        check == null && (check = this.checkValue);
        this.observers = {};
        this.fn = function(){
          var oldValue, newValue, key, ref$, observer, results$ = [];
          oldValue = this$.getValue();
          if (arguments.length === 0) {
            return oldValue;
          } else {
            check.apply(this$, arguments);
            this$.setValue(newValue = arguments[0]);
            for (key in ref$ = this$.observers) {
              observer = ref$[key];
              if (this$.shouldRunObserver(observer)) {
                results$.push(observer(newValue, oldValue));
              }
            }
            return results$;
          }
        };
        this.fn.observe = function(observer){
          var key;
          this$.observers[key = util.getRandomKey()] = observer;
          return (function(key){
            var this$ = this;
            return function(){
              var ref$, ref1$;
              return ref1$ = (ref$ = this$.observers)[key], delete ref$[key], ref1$;
            };
          }.call(this$, key));
        };
        this.fn.state = this;
      };
      prototype.getValue = function(){
        return this.value;
      };
      prototype.setValue = function(value){
        this.value = value;
      };
      prototype.checkValue = function(value){};
      prototype.shouldRunObserver = function(observer){
        return typeof observer.shouldRun !== 'function' || observer.shouldRun();
      };
      prototype.makeStateChangingDelaiable = function(){
        var this$ = this;
        this.timers = [];
        this.fn.addTimer = function(timer){
          this$.timers.push(timer);
        };
        return this.fn.clearTimers = function(){
          var i$, ref$, len$, timer;
          for (i$ = 0, len$ = (ref$ = this$.timers).length; i$ < len$; ++i$) {
            timer = ref$[i$];
            clearTimeout(timer);
          }
          this$.timers = [];
        };
      };
      prototype.clearLocalAttributes = function(obj){
        var i$, ref$, len$, attr;
        for (i$ = 0, len$ = (ref$ = this.localAttributes).length; i$ < len$; ++i$) {
          attr = ref$[i$];
          if (obj[attr.camelize()] != null) {
            delete obj[attr.camelize()];
          }
        }
        return obj;
      };
      return AbstractState;
    }());
  });
}).call(this);
