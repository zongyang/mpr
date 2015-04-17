(function(){
  define(function(require, exports, module){
    var util, DELIMITER, PREFIX;
    util = require('util');
    DELIMITER = '::';
    PREFIX = '@+';
    return {
      on: function(_event, _callback){
        (function(event, callback){
          var this$ = this;
          window.addEventListener('storage', function(storageEvent){
            if (this$.isForMe(event, storageEvent)) {
              callback(this$.parse(storageEvent));
            }
          });
        }.call(this, _event, _callback));
      },
      isForMe: function(event, storageEvent){
        var ref$, prefix, channel, url, state, type;
        ref$ = this.parseKey(storageEvent.key), prefix = ref$[0], channel = ref$[1], url = ref$[2], state = ref$[3], type = ref$[4];
        return channel === event.channel && state === event.state && type === event.type && (url === window.hostPageUrl || (typeof event.isForAllUrl === 'function' ? event.isForAllUrl() : void 8));
      },
      emit: function(event, message){
        if (typeof message === 'undefined') {
          message = {
            url: window.hostPageUrl
          };
        }
        if (typeof message === 'object') {
          message.random = this.randomToAvoidStorageEventUntriggeredWithSameValue();
        }
        window.localStorage.setItem(this.composeKey(event, message), this.composeValue(message));
      },
      set: function(attr, value){
        window.localStorage.setItem(attr, this.composeValue(value));
      },
      get: function(attr){
        return this.parseValue(window.localStorage.getItem(attr));
      },
      composeKey: function(arg$, message){
        var channel, state, type, url, key;
        channel = arg$.channel, state = arg$.state, type = arg$.type;
        url = message.url;
        key = [PREFIX, channel, url, state, type].join(DELIMITER);
        return key;
      },
      parseKey: function(key){
        var ref$, PREFIX, channel, url, state, type;
        return ref$ = key.split(DELIMITER), PREFIX = ref$[0], channel = ref$[1], url = ref$[2], state = ref$[3], type = ref$[4], ref$;
      },
      parse: function(event){
        return this.parseValue(event.newValue);
      },
      composeValue: function(obj){
        return JSON.stringify.apply(this, arguments);
      },
      parseValue: function(str){
        return JSON.parse.apply(this, arguments);
      },
      randomToAvoidStorageEventUntriggeredWithSameValue: util.getRandomKey
    };
  });
}).call(this);
