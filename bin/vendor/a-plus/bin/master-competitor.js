(function(){
  define(function(require, exports, module){
    var util, localStorageManager, state, this$ = this;
    util = require('util');
    localStorageManager = require('local-storage-manager');
    state = require('state');
    return {
      isMaster: state.add({
        'is-at-plus-running-as-master': [true, false]
      }),
      competingInterval: 400,
      heartBeatingInterval: 200,
      canMyHeartBeat: true,
      isFirstCompeteComplete: false,
      activate: function(firstCompeteDoneCallback){
        this.isMaster(false);
        window.isAtPlusRunningAsMaster = this.isMaster;
        this.compete(firstCompeteDoneCallback);
      },
      compete: function(firstCompeteDoneCallback){
        if (window.isOnExtensionBackgroundPage === true) {
          this.isMaster(true);
          window.localStorage.setItem('at-plus-browser-extension-installed', true);
          firstCompeteDoneCallback();
        } else if (window.localStorage.getItem('at-plus-browser-extension-installed')) {
          this.isMaster(false);
          firstCompeteDoneCallback();
        } else {
          this.continouslyCompeteForMaster(firstCompeteDoneCallback);
        }
      },
      continouslyCompeteForMaster: function(firstCompeteDoneCallback){
        var compete, this$ = this;
        compete = function(){
          this$.isMasterHeartBeating(function(isBeating){
            if (!isBeating && this$.canMyHeartBeat) {
              this$.enterPseudoCritialArea();
              setTimeout(function(){
                setTimeout(function(){
                  this$.isMaster(this$.noOtherCompetitorEnteredCriticalArea() ? true : false);
                  if (this$.isMaster()) {
                    this$.stopCompetingForMaster();
                    this$.startHeartBeating();
                  } else {
                    this$.stopHeartBeating();
                  }
                  this$.leavePseudoCriticalArea();
                  this$.completeFirstCompete(firstCompeteDoneCallback);
                }, 0);
              }, 0);
            } else {
              this$.completeFirstCompete(firstCompeteDoneCallback);
            }
          });
        };
        compete();
        this.masterCompetingTimer = setInterval(function(){
          compete();
        }, this.competingInterval);
      },
      completeFirstCompete: function(callback){
        if (!this.isFirstCompeteComplete) {
          this.isFirstCompeteComplete = true;
          if (typeof callback === 'function') {
            callback();
          }
        }
      },
      isMasterHeartBeating: function(callback){
        var this$ = this;
        this.updatePreviousAndCurrentHeartBeating();
        if (typeof this.previousHeartBeating === 'undefined') {
          setTimeout(function(){
            this$.isMasterHeartBeating(callback);
          }, this.heartBeatingInterval);
        } else {
          callback(this.currentHeartBeating !== this.previousHeartBeating);
        }
      },
      updatePreviousAndCurrentHeartBeating: function(){
        this.previousHeartBeating = this.currentHeartBeating;
        this.currentHeartBeating = localStorageManager.get('at-plus-master-heart-beating-token');
      },
      stopCompetingForMaster: function(){
        clearInterval(this.masterCompetingTimer);
      },
      startHeartBeating: function(){
        var heartBeat, this$ = this;
        heartBeat = function(){
          if (this$.hasOtherCompetitorTookOverMaster()) {
            this$.isMaster(false);
            this$.stopHeartBeating();
            this$.continouslyCompeteForMaster();
          } else {
            if (this$.canMyHeartBeat) {
              localStorageManager.set('at-plus-master-heart-beating-token', Date.now());
              this$.updatePreviousAndCurrentHeartBeating();
            }
          }
        };
        heartBeat();
        if (this.isMaster()) {
          this.heartBeatingTimer = setInterval(function(){
            heartBeat();
          }, this.heartBeatingInterval);
          util.events.trigger('at-plus-running-as-master');
        }
      },
      pauseHeartBeat: function(){
        this.canMyHeartBeat = false;
      },
      resumeHeartBeat: function(){
        this.canMyHeartBeat = true;
      },
      stopHeartBeating: function(){
        clearInterval(this.heartBeatingTimer);
        util.events.trigger('at-plus-running-as-slave');
      },
      hasOtherCompetitorTookOverMaster: function(){
        return this.currentHeartBeating != null && this.currentHeartBeating !== localStorageManager.get('at-plus-master-heart-beating-token');
      },
      enterPseudoCritialArea: function(){
        this.competitors = 0;
        window.addEventListener('storage', this.pseudoCriticalAreaLocker);
      },
      noOtherCompetitorEnteredCriticalArea: function(){
        return this.competitors === 0;
      },
      leavePseudoCriticalArea: function(){
        window.removeEventListener('storage', this.pseudoCriticalAreaLocker);
      },
      pseudoCriticalAreaLocker: function(event){
        if (event.key === 'at-plus-master-competition-pseduo-critical-area-entering-counter') {
          this$.competitors++;
        }
      }
    };
  });
}).call(this);
