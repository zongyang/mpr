(function(){
  define(function(require, exports, module){
    var util, syncer, localStorageChannel, webChannel;
    util = require('util');
    syncer = require('./syncer');
    localStorageChannel = require('./local-storage-channel');
    webChannel = require('./web-channel');
    return {
      createSyncers: function(configs, state, serverActions){
        var previous, result, i$, len$, config, syncerName, isGlobal, current;
        previous = null;
        result = {};
        for (i$ = 0, len$ = configs.length; i$ < len$; ++i$) {
          config = configs[i$];
          if (typeof config === 'object') {
            syncerName = Object.keys(config)[0];
            isGlobal = config[syncerName].isGlobal;
          } else {
            syncerName = config;
            isGlobal = false;
          }
          current = this.create(syncerName, state, isGlobal, serverActions);
          if (previous !== null) {
            previous.channel.connect(current.channel);
          }
          result[syncerName] = current;
          previous = current;
        }
        return result;
      },
      create: function(name, state, isGlobal, serverActions){
        var channel;
        switch (name) {
        case 'tabs':
          channel = new localStorageChannel('tabs', state, serverActions, isGlobal);
          break;
        case 'web':
          channel = new webChannel('web', state, serverActions);
        }
        return new syncer(channel, state);
      }
    };
  });
}).call(this);
