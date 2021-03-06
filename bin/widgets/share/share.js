// Generated by LiveScript 1.3.1
(function(){
  define(function(require, exports, module){
    var util, state, stateMachine, dataBinder, ui;
    util = require('util');
    state = require('state');
    stateMachine = require('state/state-machine');
    dataBinder = require('data/data-binder');
    ui = require('common/ui');
    return ui.createWidget({
      name: 'share',
      statesAppPagesMap: {
        'show': ['share']
      },
      activate: function(){
        this.addEvent();
      },
      addEvent: function(){}
    });
  });
}).call(this);
