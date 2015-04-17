(function(){
  define(function(require, exports, module){
    var allData, state, util;
    allData = require('all-data');
    state = require('state');
    util = require('util');
    return {
      initialRemoteData: function(primaryDataName, beforeSyncData, done){
        var i$, ref$, len$, data;
        if (done == null) {
          done = beforeSyncData;
          beforeSyncData = null;
        }
        for (i$ = 0, len$ = (ref$ = allData).length; i$ < len$; ++i$) {
          data = ref$[i$];
          data.createLocalState();
        }
        if (typeof beforeSyncData === 'function') {
          beforeSyncData();
        }
        state.sync.initialAllSyncData(primaryDataName, done);
      },
      reloadRemoteData: function(dataOrDataNamesList, done){
        var dataList;
        if (!Array.isArray(dataOrDataNamesList)) {
          dataOrDataNamesList = [dataOrDataNamesList];
        }
        dataList = typeof dataOrDataNamesList[0] === 'object'
          ? dataOrDataNamesList
          : this.getDataListFromDataNames(dataOrDataNamesList);
        util.AllDoneWaiter.allComplete(dataList, 'reload', done);
      },
      getDataListFromDataNames: function(dataNames){
        var i$, ref$, len$, data;
        for (i$ = 0, len$ = (ref$ = allData).length; i$ < len$; ++i$) {
          data = ref$[i$];
          if (in$(data.displayName, dataNames)) {
            data;
          }
        }
      }
    };
  });
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
