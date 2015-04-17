(function(){
  define(function(require, exports, module){
    var state, util, AbstractData;
    state = require('state');
    util = require('util');
    return AbstractData = (function(){
      AbstractData.displayName = 'AbstractData';
      var prototype = AbstractData.prototype, constructor = AbstractData;
      AbstractData.syncers = ['tabs', 'web'];
      AbstractData.globalSyncers = [
        {
          tabs: {
            isGlobal: true
          }
        }, 'web'
      ];
      AbstractData.serverActions = [];
      AbstractData.isGlobal = false;
      AbstractData.createLocalState = function(){
        this.localState = state.sync.add({
          name: this.stateName,
          unmarshalConstructor: this,
          isArray: this.isArray,
          syncers: this.isGlobal
            ? this.globalSyncers
            : this.syncers,
          initialData: this.initialData,
          isGlobal: this.isGlobal,
          serverActions: this.serverActions
        });
        this.syncer = this.localState.state.syncers.tabs || this.localState.state.syncers.web;
      };
      AbstractData.initialData = function(done){
        done();
      };
      AbstractData.reload = function(done){
        this.syncer.reloadData(done);
      };
      function AbstractData(jsonObject, isServerData){
        isServerData == null && (isServerData = true);
        this.createFromJsonObject(jsonObject, isServerData);
        if (isServerData) {
          this.adaptForLocal();
        }
      }
      prototype.createFromJsonObject = function(jsonObject, isServerData){
        if (!isServerData) {
          if ((typeof jsonObject === 'object' && !jsonObject.id) && this.constructor.isArray) {
            this.id = util.getRandomKey();
          }
        }
        import$(this, jsonObject);
        this.atPlusSource || (this.atPlusSource = 'browser');
      };
      prototype.changeFromUnderlineIdToId = function(){
        if (this._id != null) {
          this.id = this._id;
          delete this._id;
        }
      };
      prototype.changeFromIdToUnderlineId = function(data){
        if (data.id != null) {
          data._id = data.id;
          delete data.id;
        }
      };
      prototype.changeAttributeName = function(oldName, newName, data){
        data || (data = this);
        if (data[oldName] != null) {
          data[newName] = data[oldName];
          delete data[oldName];
        }
      };
      prototype.adaptForLocal = function(){
        this.changeFromUnderlineIdToId();
      };
      prototype.prepareForServer = function(){
        var data, i$, ref$, len$, property;
        data = import$({}, this);
        if (this.constructor.localAttributes) {
          for (i$ = 0, len$ = (ref$ = this.constructor.localAttributes).length; i$ < len$; ++i$) {
            property = ref$[i$];
            delete data[property.camelize()];
          }
        }
        this.adaptForServer(data);
        return data;
      };
      prototype.adaptForServer = function(data){
        this.changeFromIdToUnderlineId(data);
      };
      prototype.update = function(newValueOrAttributePath, attributeValue){
        var newValue;
        if (newValueOrAttributePath == null) {
          newValue = this;
        } else if (newValueOrAttributePath != null && attributeValue == null) {
          newValue = newValueOrAttributePath;
        } else {
          this[newValueOrAttributePath.camelize()] = attributeValue;
          newValue = this;
        }
        import$(newValue, new this.constructor.localState.state.unmarshalConstructor(newValue));
        if (this.constructor.isArray) {
          return this.constructor.localState.getElement(this.id)(newValue);
        } else {
          return this.constructor.localState(newValue);
        }
      };
      prototype.excuteOnServer = function(action, newValue, _callback, dataHandler){
        var this$ = this;
        dataHandler || (dataHandler = function(data){
          var self;
          self = this$;
          setTimeout(function(){
            self.update(import$(self, data.newValue));
          }, 0);
        });
        this.constructor.syncer.executeServerAction({
          action: action,
          id: this.id,
          newValue: newValue,
          callback: function(error, data){
            if (error) {
              if (typeof _callback === 'function') {
                _callback({
                  result: 'failed',
                  cause: error
                });
              }
            } else {
              dataHandler(data);
              setTimeout(function(){
                setTimeout(function(){
                  if (typeof _callback === 'function') {
                    _callback({
                      result: 'success'
                    });
                  }
                }, 0);
              }, 0);
            }
          }
        });
      };
      return AbstractData;
    }());
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
