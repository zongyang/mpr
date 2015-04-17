(function(){
  define(function(require, exports, module){
    var Channel;
    return Channel = (function(){
      Channel.displayName = 'Channel';
      var prototype = Channel.prototype, constructor = Channel;
      Channel.waitingForAskingNextChannelTime = 2000;
      function Channel(name, state, serverActions){
        this.name = name;
        this.state = state;
        this.serverActions = serverActions;
        this.emitAnswer = bind$(this, 'emitAnswer', prototype);
        this.getAnswerFromNext = bind$(this, 'getAnswerFromNext', prototype);
        this.tryAskingViaNext = bind$(this, 'tryAskingViaNext', prototype);
      }
      prototype.getEvent = function(type){
        return {
          channel: this.name,
          state: this.state.name,
          type: type
        };
      };
      prototype.connect = function(next){
        this.next = next;
        next.previous = this;
      };
      prototype.update = function(change){
        var ref$;
        if ((ref$ = this.next) != null) {
          ref$.send(change);
        }
        if (typeof this.localUpdate === 'function') {
          this.localUpdate(change);
        }
      };
      prototype.ask = function(askEvent, answerEvent, answerHandler, url){
        (function(answerHandler, url){
          var isMobileWebVersion, askParam, isAnswered, this$ = this;
          if (isMobileWebVersion = window.currentLocation) {
            askParam = {
              location: window.currentLocation
            };
            this.constructor.waitingForAskingNextChannelTime = 0;
          } else {
            askParam = {
              url: this.isPassingAsking(url)
                ? url
                : window.hostPageUrl
            };
          }
          isAnswered = false;
          if (answerEvent) {
            if (window.isOnExtensionBackgroundPage) {
              clearTimeout(this.waitingForAskingNextChannelTimer);
              answerHandler({
                result: "插件master的tabs-channel不需要去ask"
              });
            } else {
              this.addAnswerHandler(answerEvent, answerHandler);
              if (this.shouldAsk(url)) {
                this.messenger.emit(askEvent, askParam);
              }
            }
          } else {
            if (this.shouldAsk(url)) {
              this.messenger.emit(askEvent, askParam, function(error, data){
                if (error) {
                  throw error;
                }
                if (!isAnswered) {
                  isAnswered = true;
                  this$.handleAnswerData(data, this$.isPassingAsking(data.url), answerHandler);
                }
              });
            }
          }
          this.waitingForAskingNextChannelTimer = setTimeout(function(){
            this$.tryAskingViaNext(answerHandler, url);
          }, this.constructor.waitingForAskingNextChannelTime);
        }.call(this, answerHandler, url));
      };
      prototype.shouldAsk = function(url){
        return this.state.hasNotAnswered || this.isPassingAsking(url);
      };
      prototype.addAnswerHandler = function(){
        var addedAnswerEvents;
        addedAnswerEvents = [];
        return function(answerEvent, answerHandler){
          var eventStr, this$ = this;
          eventStr = JSON.stringify(answerEvent);
          if (!in$(eventStr, addedAnswerEvents)) {
            addedAnswerEvents.push(eventStr);
            this.messenger.on(answerEvent, function(data){
              this$.handleAnswerData(data, this$.isPassingAsking(data.url), answerHandler);
            });
          } else {}
        };
      }();
      prototype.isPassingAsking = function(url){
        return !this.isGlobal && (url != null && url !== window.hostPageUrl);
      };
      prototype.handleAnswerData = function(data, isPassing, answerHandler){
        clearTimeout(this.waitingForAskingNextChannelTimer);
        if (this.state.hasNotAnswered === null || this.state.hasNotAnswered || isPassing || this.isReload) {
          answerHandler({
            value: data,
            result: 'success'
          });
        }
        if (!isPassing) {
          this.state.hasNotAnswered = false;
        }
        this.isReload = false;
      };
      prototype.tryAskingViaNext = function(answerHandler, url){
        if (this.next && this.state.hasNotAnswered) {
          this.next.ask(answerHandler, url);
        } else if (!this.state.hasNotAnswered) {
          answerHandler({
            result: 'already-initialed'
          });
        } else {
          answerHandler({
            result: 'failed-initial-data'
          });
        }
      };
      prototype.answer = function(_askingHandler){
        var this$ = this;
        this.messenger.on(this.getEvent('ask'), function(arg$){
          var url, askingHandler;
          url = arg$.url;
          askingHandler = this$.isPassingAsking(url) ? this$.getAnswerFromNext : _askingHandler;
          askingHandler(function(){
            this$.emitAnswer.apply(this$, arguments);
          }, url);
        });
      };
      prototype.getAnswerFromNext = function(answerHandler, url){
        this.next.ask(answerHandler, url);
      };
      prototype.emitAnswer = function(initialData){
        this.messenger.emit(this.getEvent('answer'), initialData.value);
      };
      return Channel;
    }());
  });
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
