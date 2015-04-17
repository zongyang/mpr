(function(){
  define(function(require, exports, module){
    var Transition;
    return Transition = (function(){
      Transition.displayName = 'Transition';
      var util, state, prototype = Transition.prototype, constructor = Transition;
      util = require('util');
      state = require('./state');
      Transition.delimiter = '->';
      Transition.parseFromTo = function(name){
        return name.split(this.delimiter).map(function(it){
          return it.trim();
        });
      };
      function Transition(arg$, history){
        var ref$;
        this.stateName = arg$.stateName, this.name = arg$.name, this.cause = arg$.cause, this.spec = arg$.spec, this.hotArea = arg$.hotArea, this.appearedArea = arg$.appearedArea;
        this.history = history;
        this.state = state[this.stateName.camelize()];
        ref$ = constructor.parseFromTo(this.name), this.from = ref$[0], this.to = ref$[1];
        this.appearedArea = this.spec.appearedArea || this.appearedArea;
        this.condition = this.spec.condition || function(){
          return true;
        };
        this.delay = util.isNumber(this.spec.delay) ? parseInt(this.spec.delay) : false;
        this.action = this.spec.action;
        this.after = this.spec.after;
        this.parseTypeAndSetAttributes();
        switch (this.type) {
        case 'ui-event':
          this.createUiEventTransition();
          break;
        case '@+ui-event':
          this.createAtPlusUiEventTransition();
          break;
        case 'hostpage':
          this.createHostpageEventTransition();
          break;
        case 'state':
          this.createStateTransition();
          break;
        case 'auto':
          this.createAutoTransition();
        }
      }
      prototype.parseTypeAndSetAttributes = function(){
        var ref$, t1, t2;
        ref$ = this.cause.split(':'), t1 = ref$[0], t2 = ref$[1];
        switch (t1) {
        case '@+':
          if (t2 === 'auto') {
            this.type = 'auto';
          } else {
            this.type = 'state';
            ref$ = t2.split('|'), this.observedStateName = ref$[0], this.observerType = ref$[1];
            this.observedState = state[this.observedStateName.camelize()];
          }
          break;
        case '@+e':
          this.type = '@+ui-event';
          this.eventName = t2;
          break;
        case 'hostpage':
          this.type = 'hostpage';
          this.eventName = this.spec.event;
          break;
        default:
          this.type = 'ui-event';
          this.eventName = t1;
          this.hotArea = this.spec.hotArea || this.spec.appearedArea || this.hotArea;
          if ((ref$ = this.hotArea) != null && ref$.isLive) {
            this.isLiveHotArea = true;
            this.hotAreaSelector = this.hotArea.selector;
          }
          this.ignoreBubbled = typeof this.spec.ignoreBubbled !== 'undefined' ? this.spec.ignoreBubbled : false;
          this.preventDefault = typeof this.spec.preventDefault !== 'undefined'
            ? this.spec.preventDefault
            : true && this.eventName !== 'keydown';
          this.stopPropagation = typeof this.spec.stopPropagation !== 'undefined'
            ? this.spec.stopPropagation
            : true && this.eventName !== 'keydown';
        }
      };
      prototype.createAtPlusUiEventTransition = function(){
        var this$ = this;
        util.events.on(this.eventName, function(event){
          this$.event = event;
          this$.delayOrImmediatelyTransit();
        });
      };
      prototype.createUiEventTransition = function(){
        var this$ = this;
        if (this.isLiveHotArea) {
          $(document).on(this.eventName, this.hotAreaSelector, function(event){
            this$.event = event;
            this$.delayOrImmediatelyTransit();
          });
        } else {
          $(this.hotArea).on(this.eventName, function(event){
            this$.event = event;
            if (this$.stopPropagation) {
              this$.event.stopPropagation();
            }
            if (this$.preventDefault) {
              this$.event.preventDefault();
            }
            if (!this$.ignoreBubbled || this$.event.target === this$.hotArea.get(0)) {
              this$.delayOrImmediatelyTransit();
            }
          });
        }
      };
      prototype.createHostpageEventTransition = function(){
        var this$ = this;
        util.hostPage.on(this.eventName, function(event){
          this$.event = event;
          this$.delayOrImmediatelyTransit();
        });
      };
      prototype.createStateTransition = function(){
        var observerType, this$ = this;
        this.observedState.observe(function(){
          this$.observed = arguments;
          this$.delayOrImmediatelyTransit();
        }, observerType = this.observerType === 'individual' ? 'add' : 'element');
      };
      prototype.createAutoTransition = function(){
        var this$ = this;
        this.state.observe(function(currentState){
          this$.delayOrImmediatelyTransit();
        });
      };
      prototype.delayOrImmediatelyTransit = function(){
        var this$ = this;
        if (this.delay) {
          return this.state.addTimer(setTimeout(function(){
            if (this$.state() === this$.from) {
              this$.conditionalTransit();
            }
          }, this.delay));
        } else {
          return this.conditionalTransit();
        }
      };
      prototype.conditionalTransit = function(){
        if (this.isTransitionFromCurrentState() && this.condition.apply(this, this.observed)) {
          this.transit();
        }
      };
      prototype.isTransitionFromCurrentState = function(){
        return this.state() === this.from || this.isWildcardApply(this.from, this.state());
      };
      prototype.isWildcardApply = function(exp, name){
        var end;
        switch (false) {
        case exp.indexOf('^') !== 0:
          return exp.substr(1, exp.length - 1) !== name;
        case !(0 <= (end = exp.indexOf('*'))):
          return exp.substr(0, end) === name.substr(0, end);
        default:
          return false;
        }
      };
      prototype.transit = function(){
        var toState, this$ = this;
        this.state.clearTimers();
        toState = this.to === '__BACK__'
          ? this.history.pop()
          : this.to;
        if (this.appearedArea != null) {
          this.changeUiClass(toState);
        }
        this.doAction();
        setTimeout(function(){
          if (this$.to !== '__BACK__') {
            this$.history.push(this$.state());
          }
          this$.state(toState);
          if (typeof this$.after === 'function') {
            this$.after();
          }
        }, 0);
      };
      prototype.changeUiClass = function(toState){
        var from, to;
        from = this.normalizeClassName(this.from);
        to = this.normalizeClassName(toState);
        $(this.appearedArea).removeClass(from).addClass(to);
      };
      prototype.normalizeClassName = function(className){
        return className.replace(/\./g, ' ').replace('none', '').trim();
      };
      prototype.doAction = function(){
        if (this.action != null) {
          switch (this.type) {
          case 'ui-event':
            this.action(this.event);
            break;
          case 'hostpage':
            this.action(this.event);
            break;
          case 'state':
            this.action.apply(this, this.observed);
            break;
          case 'auto':
            this.action();
          }
        }
      };
      return Transition;
    }());
  });
}).call(this);
