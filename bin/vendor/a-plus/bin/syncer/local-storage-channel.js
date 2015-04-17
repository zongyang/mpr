(function(){
  define(function(require, exports, module){
    var localStorageManager, channel, LocalStorageChannel;
    localStorageManager = require('local-storage-manager');
    channel = require('./channel');
    return LocalStorageChannel = (function(superclass){
      var prototype = extend$((import$(LocalStorageChannel, superclass).displayName = 'LocalStorageChannel', LocalStorageChannel), superclass).prototype, constructor = LocalStorageChannel;
      function LocalStorageChannel(name, state, serverActions, isGlobal){
        this.isGlobal = isGlobal;
        this.receive = bind$(this, 'receive', prototype);
        this.send = bind$(this, 'send', prototype);
        LocalStorageChannel.superclass.call(this, name, state, serverActions);
        this.messenger = localStorageManager;
      }
      prototype.isForAllUrl = function(){
        return this.isGlobal || window.isAtPlusRunningAsMaster();
      };
      prototype.send = function(change){
        this.messenger.emit(this.getEvent('update'), change);
      };
      prototype.receive = function(callback){
        var event, this$ = this;
        event = this.getEvent('update', this.isForAllUrl);
        this.messenger.on(event, function(change){
          var ref$;
          if ((ref$ = this$.next) != null) {
            ref$.send(change);
          }
          callback(change, this$.isGlobal);
          if ((ref$ = this$.previous) != null) {
            ref$.send(change);
          }
        });
      };
      prototype.getEvent = function(type){
        var event, this$ = this;
        event = superclass.prototype.getEvent.call(this, type);
        event.isForAllUrl = function(){
          return this$.isForAllUrl();
        };
        return event;
      };
      prototype.ask = function(callback){
        superclass.prototype.ask.call(this, this.getEvent('ask'), this.getEvent('answer'), callback);
      };
      prototype.reload = function(callback){
        if (!window.isAtPlusRunningAsMaster()) {
          this.addAnswerHandler(this.getEvent('reload-answer'), callback);
          this.messenger.emit(this.getEvent('reload-ask'));
        }
      };
      prototype.answerReload = function(callback){
        var this$ = this;
        this.messenger.on(this.getEvent('reload-ask'), function(arg$){
          var url;
          url = arg$.url;
          this$.next.ask(function(data){
            if (callback) {
              callback(data.value);
            }
            this$.messenger.emit(this$.getEvent('reload-answer'), data.value);
          }, url);
        });
      };
      prototype.mediateServerActions = function(){
        var i$, ref$, len$, action;
        for (i$ = 0, len$ = (ref$ = this.serverActions).length; i$ < len$; ++i$) {
          action = ref$[i$];
          this.mediateServerAction(action);
        }
      };
      prototype.mediateServerAction = function(action){
        var this$ = this;
        this.messenger.on(this.getEvent("send-server-action-" + action), function(arg$){
          var url, id, newValue;
          url = arg$.url, id = arg$.id, newValue = arg$.newValue;
          this$.next.handleServerAction({
            url: url,
            id: id,
            action: action,
            state: this$.state.name,
            newValue: newValue
          });
        });
      };
      return LocalStorageChannel;
    }(channel));
  });
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
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
