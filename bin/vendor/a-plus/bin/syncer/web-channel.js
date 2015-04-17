(function(){
  define(function(require, exports, module){
    var state, hostConfig, channel, socketAdapter, WebChannel;
    state = require('state');
    hostConfig = require('host-config');
    channel = require('./channel');
    socketAdapter = require('./socket-adapter');
    return WebChannel = (function(superclass){
      var prototype = extend$((import$(WebChannel, superclass).displayName = 'WebChannel', WebChannel), superclass).prototype, constructor = WebChannel;
      WebChannel.isActivated = false;
      WebChannel.role = 'slave';
      WebChannel.masterSlaveSwitcher = function(masterHandler, slaveHandler){
        var this$ = this;
        if (window.isAtPlusRunningAsMaster()) {
          masterHandler();
        } else {
          slaveHandler();
        }
        window.isAtPlusRunningAsMaster.observe(function(isMaster){
          if (isMaster) {
            if (this$.role === 'slave') {
              masterHandler();
            }
          } else {
            if (this$.role === 'master') {
              slaveHandler();
            }
          }
        });
      };
      WebChannel.activate = function(done){
        var this$ = this;
        this.masterSlaveSwitcher(function(){
          this$.role = 'master';
          socketAdapter.connectServer(function(currentUser){
            this$.activationCallback(function(){
              var isMaster;
              done(currentUser, isMaster = true);
            });
          });
        }, function(){
          this$.role = 'slave';
          socketAdapter.disconnectServer(function(){
            this$.activationCallback(done);
          });
        });
      };
      WebChannel.activationCallback = function(done){
        if (!this.isActivated) {
          this.isActivated = true;
          done();
        }
      };
      function WebChannel(){
        this.receive = bind$(this, 'receive', prototype);
        this.send = bind$(this, 'send', prototype);
        WebChannel.superclass.apply(this, arguments);
        this.messenger = socketAdapter;
      }
      prototype.send = function(change){
        if (this.constructor.role === 'master') {
          if (change.action === "add") {
            this.messenger.emit("add-" + this.state.name, change);
          }
          if (change.action === "update-element") {
            this.messenger.emit("update-element-of-" + this.state.name, change);
          }
          if (change.action === "remove") {
            this.messenger.emit("remove-" + this.state.name, change);
          }
          if (!change.action) {
            this.messenger.emit("update-" + this.state.name, change);
          }
        }
      };
      prototype.receive = function(callback){
        var this$ = this;
        if (this.constructor.role === 'master') {
          this.messenger.on("new-" + this.state.name, function(change){
            var ref$;
            callback(change, this$.state.isGlobal);
            if ((ref$ = this$.previous) != null) {
              ref$.send(change);
            }
          });
          this.messenger.on("updated-element-of-" + this.state.name, function(change){
            var ref$;
            callback(change, this$.state.isGlobal);
            if ((ref$ = this$.previous) != null) {
              ref$.send(change);
            }
          });
          this.messenger.on("partial-updated-element-of-" + this.state.name, function(change){
            var ref$;
            callback(change, this$.state.isGlobal);
            if ((ref$ = this$.previous) != null) {
              ref$.send(change);
            }
          });
          this.messenger.on("updated-" + this.state.name, function(change){
            var ref$;
            callback(change, this$.state.isGlobal);
            if ((ref$ = this$.previous) != null) {
              ref$.send(change);
            }
          });
          this.messenger.on("change-id-" + this.state.name, function(change){
            var ref$;
            callback(change, this$.state.isGlobal);
            if ((ref$ = this$.previous) != null) {
              ref$.send(change);
            }
          });
        }
      };
      prototype.ask = function(callback, url){
        if (this.constructor.role === 'master') {
          superclass.prototype.ask.call(this, "ask-" + this.state.name, null, callback, url);
        } else {
          callback({
            result: 'slave-dont-ask-data-via-web-channel'
          });
        }
      };
      prototype.answer = null;
      prototype.reload = function(){
        if (this.constructor.role === 'master') {
          superclass.prototype.reload.call(this, "ask-" + this.state.name, null, this.localUpdater, window.hostPageUrl);
        }
      };
      prototype.handleServerAction = function(arg$){
        var url, id, action, state, newValue, this$ = this;
        url = arg$.url, id = arg$.id, action = arg$.action, state = arg$.state, newValue = arg$.newValue;
        return this.messenger.emit(state + "-" + action, {
          id: id,
          url: url,
          newValue: newValue
        }, function(error, result){
          this$.previous.messenger.emit(this$.previous.getEvent("receive-server-action-result-" + action), {
            url: url,
            newValue: {
              error: error,
              result: result
            }
          });
        });
      };
      return WebChannel;
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
