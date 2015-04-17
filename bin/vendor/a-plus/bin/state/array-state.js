(function(){
  define(function(require, exports, module){
    var abstractState, objectState, util, ArrayState;
    abstractState = require('./abstract-state');
    objectState = require('./object-state');
    util = require('util');
    return ArrayState = (function(superclass){
      var prototype = extend$((import$(ArrayState, superclass).displayName = 'ArrayState', ArrayState), superclass).prototype, constructor = ArrayState;
      function ArrayState(){
        this.isArray = true;
        this.type = 'array';
        this.createObservableArray();
        ArrayState.superclass.apply(this, arguments);
      }
      prototype.createObservableArray = function(isElementObservable){
        var check, objectObserver, this$ = this;
        this.value = {};
        this.createObservable(check = function(args){
          var i$, len$, arg;
          for (i$ = 0, len$ = args.length; i$ < len$; ++i$) {
            arg = args[i$];
            this$.checkValue(arg);
          }
        });
        this.arrayObservers = {};
        this.addObservedArrayOperations();
        objectObserver = this.fn.observe;
        this.fn.observe = function(observer, observerType){
          var key, ref$;
          observerType == null && (observerType = 'element');
          if (observerType === 'element') {
            return objectObserver.apply(this$, arguments);
          } else {
            key = util.getRandomKey();
            if (observerType === 'add') {
              (ref$ = this$.arrayObservers).add || (ref$.add = {});
              this$.arrayObservers.add[key] = observer;
              return (function(key){
                var this$ = this;
                return function(){
                  var ref$, ref1$;
                  return ref1$ = (ref$ = this$.arrayObservers.add)[key], delete ref$[key], ref1$;
                };
              }.call(this$, key));
            } else {
              (ref$ = this$.arrayObservers).remove || (ref$.remove = {});
              this$.arrayObservers.remove[key] = observer;
              return (function(key){
                var this$ = this;
                return function(){
                  var ref$, ref1$;
                  return ref1$ = (ref$ = this$.arrayObservers.remove)[key], delete ref$[key], ref1$;
                };
              }.call(this$, key));
            }
          }
        };
        this.fn.getElement = function(elementId){
          return this.state.value[elementId];
        };
        this.fn.clear = function(){
          this.state.setValue([]);
        };
      };
      prototype.getValue = function(){
        var key, ref$, value, results$ = [];
        for (key in ref$ = this.value) {
          value = ref$[key];
          results$.push(value());
        }
        return results$;
      };
      prototype.setValue = function(elements){
        var id, ref$, objectState, callObservers, i$, len$, element, results$ = [];
        for (id in ref$ = this.value) {
          objectState = ref$[id];
          this.fn.remove(id, callObservers = true);
        }
        for (i$ = 0, len$ = elements.length; i$ < len$; ++i$) {
          element = elements[i$];
          results$.push(this.fn.add(element));
        }
        return results$;
      };
      prototype.createElementObserver = function(element){
        var elementState, elementObservable, this$ = this;
        elementState = new objectState(this.name + element.id);
        elementObservable = this.value[element.id] = elementState.fn;
        elementObservable(element);
        elementObservable.observe(function(newValue, oldValue){
          this$.runArrayObservers(newValue, 'element');
        });
      };
      prototype.addObservedArrayOperations = function(){
        this.addObservedArrayAdd();
        this.addObservedArrayRemove();
        this.addObservedArrayUpdateElement();
        this.addObservedArrayPartialUpdateElement();
        this.addObservedArrayChangeIdOfElement();
      };
      prototype.addObservedArrayAdd = function(){
        var this$ = this;
        this.fn.add = function(element, callObservers){
          callObservers == null && (callObservers = true);
          this$.createElementObserver(element);
          if (callObservers) {
            this$.runArrayObservers(element, 'add');
          }
        };
      };
      prototype.runArrayObservers = function(value, operation){
        var observers, key, observer, i$, len$;
        observers = (function(){
          var ref$, results$ = [];
          for (key in ref$ = this.arrayObservers[operation]) {
            observer = ref$[key];
            results$.push(observer);
          }
          return results$;
        }.call(this)).concat((function(){
          var ref$, results$ = [];
          for (key in ref$ = this.observers) {
            observer = ref$[key];
            results$.push(observer);
          }
          return results$;
        }.call(this)));
        for (i$ = 0, len$ = observers.length; i$ < len$; ++i$) {
          observer = observers[i$];
          if (this.shouldRunObserver(observer)) {
            observer(value, operation);
          }
        }
      };
      prototype.addObservedArrayRemove = function(){
        var this$ = this;
        this.fn.remove = function(elementOrId, callObservers){
          var id, element;
          callObservers == null && (callObservers = true);
          id = typeof elementOrId === 'object' ? elementOrId.id : elementOrId;
          element = this$.value[id]();
          delete this$.value[id];
          if (callObservers) {
            this$.runArrayObservers(element, 'remove');
          }
        };
      };
      prototype.addObservedArrayUpdateElement = function(){
        var this$ = this;
        this.fn.updateElement = this.fn['update-element'] = function(element){
          var elementObservable;
          elementObservable = this$.value[element.id];
          elementObservable(element);
        };
      };
      prototype.addObservedArrayPartialUpdateElement = function(){
        var this$ = this;
        this.fn.partialUpdatedElement = this.fn['partial-updated-element'] = function(element){
          var elementObservable, oldValue;
          elementObservable = this$.value[element.id];
          oldValue = elementObservable();
          elementObservable(import$(oldValue, element));
        };
      };
      prototype.addObservedArrayChangeIdOfElement = function(){
        var this$ = this;
        this.fn.changeIdElement = this.fn['change-id-element'] = function(arg$){
          var oldId, newId, elementObservable, element;
          oldId = arg$.oldId, newId = arg$.newId;
          elementObservable = this$.value[newId] = this$.value[oldId];
          element = elementObservable();
          element.id = newId;
          elementObservable(element);
          delete this$.value[oldId];
        };
      };
      return ArrayState;
    }(abstractState));
  });
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
