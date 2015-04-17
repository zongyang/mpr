(function(){
  define(function(require, exports, module){
    var syncersFactory, util, arrayState, objectState, State;
    syncersFactory = require('syncers-factory');
    util = require('util');
    arrayState = require('./array-state');
    objectState = require('./object-state');
    return window.atPlusStates || (window.atPlusStates = State = {
      add: function(){
        var state;
        if (State[name.camelize()] != null) {
          return State[name.camelize()];
        }
        state = this.create.apply(this, arguments);
        return State[state.name.camelize()] = state.fn;
      },
      create: function(def, defaultValueOrOption){
        var isArray, defaultValue, name, legalValues, state;
        isArray = typeof defaultValueOrOption === 'object' && (defaultValueOrOption != null && defaultValueOrOption.isArray) ? true : false;
        if (!(typeof defaultValueOrOption === 'object' && (defaultValueOrOption != null ? defaultValueOrOption.isArray : void 8) != null)) {
          defaultValue = defaultValueOrOption;
        }
        if (typeof def === 'object') {
          name = Object.keys(def)[0];
          legalValues = def[name];
        } else {
          name = def;
          legalValues = 'any';
        }
        return state = new (isArray ? arrayState : objectState)(name, defaultValue, legalValues);
      },
      sync: {
        syncStates: [],
        add: function(arg$){
          var name, unmarshalConstructor, isArray, localAttributes, syncers, initialData, serverActions, isGlobal, state;
          name = arg$.name, unmarshalConstructor = arg$.unmarshalConstructor, isArray = arg$.isArray, localAttributes = arg$.localAttributes, syncers = arg$.syncers, initialData = arg$.initialData, serverActions = arg$.serverActions, isGlobal = arg$.isGlobal;
          if (State[name.camelize()] != null) {
            return State[name.camelize()];
          }
          this.syncStates.push(state = State.create(name, {
            isArray: isArray
          }));
          state.unmarshalConstructor = unmarshalConstructor;
          state.localAttributes = unmarshalConstructor.localAttributes;
          state.initialData = initialData;
          state.syncers = syncersFactory.createSyncers(syncers, state, serverActions);
          state.isGlobal = isGlobal;
          return State[name.camelize()] = state.fn;
        },
        initialAllSyncData: function(primaryDataName, done){
          var syncers, priSyncers, i$, ref$, len$, state, name, ref1$, syncer;
          syncers = [];
          priSyncers = [];
          for (i$ = 0, len$ = (ref$ = this.syncStates).length; i$ < len$; ++i$) {
            state = ref$[i$];
            for (name in ref1$ = state.syncers) {
              syncer = ref1$[name];
              if (state.name === primaryDataName) {
                priSyncers.push(syncer);
              } else {
                syncers.push(syncer);
              }
            }
          }
          util.AllDoneWaiter.allComplete(priSyncers, 'initial', function(){
            util.AllDoneWaiter.allComplete(syncers, 'initial', done);
          });
        }
      },
      compute: function(statesFns, fn){
        var states, res$, i$, len$, sfn, statesNames, s, state, oldFn, compute, observe, canclers;
        res$ = [];
        for (i$ = 0, len$ = statesFns.length; i$ < len$; ++i$) {
          sfn = statesFns[i$];
          res$.push(sfn.state);
        }
        states = res$;
        res$ = [];
        for (i$ = 0, len$ = states.length; i$ < len$; ++i$) {
          s = states[i$];
          res$.push(s.name);
        }
        statesNames = res$;
        this.checkStatesExist(statesNames);
        state = this.add('computation-' + Math.random() + statesNames.join('-')).state;
        oldFn = state.fn;
        state.fn = function(){
          if (arguments.length > 0) {
            return console.error("computation can't be assign value directly");
          } else {
            return oldFn();
          }
        };
        import$(state.fn, oldFn);
        compute = function(){
          var s;
          return oldFn(fn.apply(null, (function(){
            var i$, ref$, len$, results$ = [];
            for (i$ = 0, len$ = (ref$ = states).length; i$ < len$; ++i$) {
              s = ref$[i$];
              results$.push(s.getValue());
            }
            return results$;
          }())));
        };
        observe = function(){
          var i$, ref$, len$, s, results$ = [];
          for (i$ = 0, len$ = (ref$ = states).length; i$ < len$; ++i$) {
            s = ref$[i$];
            results$.push(s.fn.observe(compute));
          }
          return results$;
        };
        canclers = observe();
        state.fn.pauseObserve = function(){
          var observers, res$, i$, ref$, len$, c;
          res$ = [];
          for (i$ = 0, len$ = (ref$ = canclers).length; i$ < len$; ++i$) {
            c = ref$[i$];
            res$.push(c());
          }
          observers = res$;
          canclers = [];
          return observers;
        };
        state.fn.resumeObserve = function(){
          var s;
          if (canclers.length === 0) {
            return canclers = (function(){
              var i$, ref$, len$, results$ = [];
              for (i$ = 0, len$ = (ref$ = states).length; i$ < len$; ++i$) {
                s = ref$[i$];
                results$.push(s.fn.observe(compute));
              }
              return results$;
            }());
          }
        };
        compute();
        return state.fn;
      },
      checkStatesExist: function(statesNames){},
      mixinTemporaryState: function(widget, option){
        var area, ref$, this$ = this;
        if (typeof option.isHovered !== 'undefined') {
          area = widget.hotArea || widget.view;
          widget.isHovered = this.add((ref$ = {}, ref$["is-" + widget.name + "-hovered"] = [true, false], ref$));
          area.on('mouseenter', function(){
            widget.isHovered(true);
          }).on('mouseleave', void 8, function(){
            widget.isHovered(false);
          });
          widget.isHovered(option.isHovered);
        }
        if (typeof option.isShown !== 'undefined') {
          area = widget.appearedArea || widget.view;
          widget.isShown = this.add((ref$ = {}, ref$["is-" + widget.name + "-shown"] = [true, false], ref$));
          widget.show = function(){
            $(area).show();
            widget.isShown(true);
          };
          widget.hide = function(){
            $(area).hide();
            widget.isShown(false);
          };
          widget.isShown(option.isShown);
        }
      }
    });
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
