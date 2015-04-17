(function(){
  define(function(require, exports, module){
    var state, hostConfig, channel, jquery;
    state = require('state');
    hostConfig = require('host-config');
    channel = require('./channel');
    jquery = require('jquery.cookie');
    return {
      socket: null,
      errorMessage: null,
      initialSocket: function(callback){
        var responseInitialHandler, this$ = this;
        if (this.socket) {
          this.sessionId = $.cookie('sid');
          responseInitialHandler = function(initialData){
            if (typeof callback === 'function') {
              callback(initialData);
            }
            return this$.socket.removeListener('response-initial', responseInitialHandler);
          };
          this.socket.on('response-initial', responseInitialHandler);
          this.socket.emit('request-initial', this.sessionId);
        }
      },
      connectServer: function(callback){
        var options, this$ = this;
        options = {
          reconnection: true,
          reconnectionDelay: 1000
        };
        if (hostConfig.isUsingMediateServer) {
          this.socket = io(hostConfig.name, options);
        } else {
          this.socket = io(hostConfig.endServer.url, options);
        }
        this.socket.on('connect_error', function(){
          this$.errorMessage = "Unable to connect server, please try again later";
        });
        this.socket.on('reconnect_error', function(){
          this$.errorMessage = "Network unavailable, please check your network connection";
        });
        this.socket.on('reconnect_attempt', function(){
          this$.errorMessage = "it's trying to reconnect, please try again later";
        });
        this.socket.on('reconnecting', function(){
          this$.errorMessage = "it's trying to reconnect, please try again later";
        });
        this.socket.on('reconnect', function(){
          this$.initialSocket(function(){
            this$.errorMessage = null;
          });
        });
        this.initialSocket(function(arg$){
          var user, sessionId;
          user = arg$.user, sessionId = arg$.sessionId;
          this$.sessionId = sessionId;
          if (!$.cookie('sid')) {
            $.cookie('sid', sessionId, {
              path: '/'
            });
          }
          if (typeof callback === 'function') {
            callback(user);
          }
        });
      },
      disconnectServer: function(callback){
        var ref$;
        if ((ref$ = this.socket) != null) {
          ref$.disconnect();
        }
        this.socket = null;
        callback();
      },
      emit: function(event, change, callback){
        var this$ = this;
        if (this.errorMessage) {
          setTimeout(function(){
            if (typeof callback === 'function') {
              callback(this$.errorMessage);
            }
          }, 0);
        } else {
          change.sessionId = this.sessionId;
          this.socket.emit(event, change, callback);
        }
      },
      on: function(event, callback){
        this.socket.on(event, function(data){
          callback(data);
        });
      }
    };
  });
}).call(this);
