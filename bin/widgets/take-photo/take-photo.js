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
      name: 'take-photo',
      statesAppPagesMap: {
        'show': ['take-photo']
      },
      cameraFileInput: $('#take-photo .back-input input'),
      upPhoto: $('#up-photo .selected-file'),
      activate: function(){
        this.addUpBtnEvet();
      },
      addUpBtnEvet: function(){
        var this$ = this;
        this.cameraFileInput[0].onchange = function(){
          var file, reader;
          file = this$.cameraFileInput[0].files[0];
          reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function(){
            this$.upPhoto[0].src = reader.result;
            state.selectFinish(true);
            setTimeout(function(){
              state.upPhotoFinish(true);
            }, 3000);
          };
        };
      }
    });
  });
}).call(this);
