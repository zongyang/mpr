(function(){
  define(function(require, exports, module){
    var Syncer;
    return Syncer = (function(){
      Syncer.displayName = 'Syncer';
      var prototype = Syncer.prototype, constructor = Syncer;
      Syncer.guardForNotExecuteObserversOfSyncers = function(observersUpdateOnChange){
        Syncer.isChangeFromSyncer = true;
        observersUpdateOnChange();
        Syncer.isChangeFromSyncer = false;
      };
      Syncer.shouldRunLocalStateObserversOfSyncers = function(){
        return !Syncer.isChangeFromSyncer;
      };
      function Syncer(channel, state){
        this.channel = channel;
        this.state = state;
        this.askingHandle = bind$(this, 'askingHandle', prototype);
        this.localUpdater = bind$(this, 'localUpdater', prototype);
      }
      prototype.initial = function(done){
        var ref$, this$ = this;
        this.listenAndEmitLocalStateChange();
        this.listenAndSyncOthersStateChange();
        this.startToAnswerOthersAsking();
        if (window.isAtPlusRunningAsMaster()) {
          this.startToAnswerOthersReloadAsking();
        }
        if (typeof (ref$ = this.channel).mediateServerActions === 'function') {
          ref$.mediateServerActions();
        }
        this.askData(function(){
          var ref$;
          if (typeof (ref$ = this$.state).initialData === 'function') {
            ref$.initialData(done);
          }
        });
      };
      prototype.listenAndEmitLocalStateChange = function(){
        var observer, observerType, this$ = this;
        observer = function(newValue, oOrA){
          this$.channel.send(import$({
            newValue: this$.marshal(newValue),
            url: window.hostPageUrl
          }, this$.state.isArray
            ? {
              action: oOrA
            }
            : {
              oldValue: oOrA
            }));
        };
        observer.shouldRun = Syncer.shouldRunLocalStateObserversOfSyncers;
        if (this.state.isArray) {
          this.state.fn.observe(observer, observerType = 'add');
          this.state.fn.observe(observer, observerType = 'remove');
        } else {
          this.state.fn.observe(observer, observerType = 'element');
        }
      };
      prototype.localUpdater = function(change, isGlobal){
        var newValue, this$ = this;
        if ((change.url === window.hostPageUrl || isGlobal) || (change.url == null && !window.hostPageUrl)) {
          newValue = this.unmarshal(change.newValue);
          Syncer.guardForNotExecuteObserversOfSyncers(function(){
            switch (false) {
            case change.action !== 'answer':
              this$.initialLocalData(newValue);
              break;
            case change.action == null:
              this$.state.fn[change.action](newValue);
              break;
            default:
              this$.state.fn(newValue);
            }
          });
        }
      };
      prototype.initialLocalData = function(data){
        this.state.setValue(data);
      };
      prototype.unmarshal = function(value){
        var i$, len$, element, results$ = [];
        if (Array.isArray(value)) {
          for (i$ = 0, len$ = value.length; i$ < len$; ++i$) {
            element = value[i$];
            results$.push(this.createObjectOrPrimitive(element));
          }
          return results$;
        } else {
          return this.createObjectOrPrimitive(value);
        }
      };
      prototype.createObjectOrPrimitive = function(value){
        if (typeof value === 'object') {
          return new this.state.unmarshalConstructor(value);
        } else {
          return value;
        }
      };
      prototype.marshal = function(value){
        var marshalElement, i$, len$, element, results$ = [];
        marshalElement = function(element){
          if (element.prepareForServer) {
            return element.prepareForServer();
          } else {
            return element;
          }
        };
        if (Array.isArray(value)) {
          for (i$ = 0, len$ = value.length; i$ < len$; ++i$) {
            element = value[i$];
            results$.push(marshalElement(element));
          }
          return results$;
        } else {
          return marshalElement(value);
        }
      };
      prototype.listenAndSyncOthersStateChange = function(){
        this.channel.receive(this.localUpdater);
      };
      prototype.startToAnswerOthersAsking = function(){
        var ref$;
        if (typeof (ref$ = this.channel).answer === 'function') {
          ref$.answer(this.askingHandle);
        }
      };
      prototype.startToAnswerOthersReloadAsking = function(){
        var this$ = this;
        if (this.channel.answerReload && window.isAtPlusRunningAsMaster()) {
          this.channel.answerReload(function(data){
            this$.localUpdater(data, true);
          });
        }
      };
      prototype.askingHandle = function(callback){
        callback({
          value: {
            newValue: this.marshal(this.state.fn()),
            url: window.hostPageUrl
          }
        });
      };
      prototype.askData = function(done){
        var this$ = this;
        this.state.hasNotAnswered = true;
        this.channel.ask(function(initialData){
          if (initialData.result === 'success') {
            this$.localUpdater(initialData.value, this$.channel.isGlobal);
          }
          this$.state.hasNotAnswered = null;
          if (typeof done === 'function') {
            done();
          }
        });
      };
      prototype.reloadData = function(done, isGlobal){
        var this$ = this;
        isGlobal == null && (isGlobal = true);
        this.channel.isReload = true;
        this.channel.reload(function(data){
          this$.localUpdater(data.value, isGlobal);
          done();
        });
      };
      prototype.executeServerAction = function(arg$){
        var action, id, newValue, callback, isTabsSyncer, url, channel, this$ = this;
        action = arg$.action, id = arg$.id, newValue = arg$.newValue, callback = arg$.callback;
        if (this.channel.next) {
          isTabsSyncer = true;
        }
        if (window.isAtPlusRunningAsMaster()) {
          url = window.hostPageUrl;
          channel = isTabsSyncer
            ? this.channel.next
            : this.channel;
          channel.messenger.emit(this.state.name + "-" + action, {
            id: id,
            url: url,
            newValue: newValue
          }, function(error, result){
            Syncer.guardForNotExecuteObserversOfSyncers(function(){
              if (typeof callback === 'function') {
                callback(error, this$.unmarshal(result));
              }
            });
          });
        } else {
          this.channel.messenger.on(this.channel.getEvent("receive-server-action-result-" + action), function(arg$){
            var url, newValue;
            url = arg$.url, newValue = arg$.newValue;
            Syncer.guardForNotExecuteObserversOfSyncers(function(){
              if (typeof callback === 'function') {
                callback(newValue.error, this$.unmarshal(newValue.result));
              }
            });
          });
          this.channel.messenger.emit(this.channel.getEvent("send-server-action-" + action), {
            url: window.hostPageUrl,
            id: id,
            newValue: newValue
          });
        }
      };
      return Syncer;
    }());
  });
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
