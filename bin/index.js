// Generated by LiveScript 1.3.1
(function(){
  if (require.config) {
    require.config({
      baseUrl: '.',
      packages: [
        {
          name: 'host-config',
          main: 'host-config.js',
          location: '..'
        },
        {
          name: 'util',
          main: 'util.js',
          location: '../vendor/a-plus/bin'
        },
        {
          name: 'state',
          main: 'state.js',
          location: '../vendor/a-plus/bin/state'
        },
        {
          name: 'data',
          main: 'data-manager.js',
          location: '../vendor/a-plus/bin/data'
        },
        {
          name: 'syncers-factory',
          main: 'syncers-factory.js',
          location: '../vendor/a-plus/bin/syncer'
        },
        {
          name: 'local-storage-manager',
          main: 'local-storage-manager.js',
          location: '../vendor/a-plus/bin'
        },
        {
          name: 'middle-wares',
          main: 'middle-wares.js',
          location: 'common'
        },
        {
          name: 'all-data',
          main: 'data-spec.js',
          location: '.'
        },
        {
          name: 'semantic-ui',
          main: 'semantic.js',
          location: '../vendor/semantic-ui/dist'
        },
        {
          name: 'a-plus',
          main: 'ui.js',
          location: 'vendor/a-plus/bin'
        },
        {
          name: 'a-plus',
          main: 'ui.js',
          location: 'vendor/a-plus/bin'
        },
        {
          name: 'a-plus',
          main: 'ui.js',
          location: 'vendor/a-plus/bin'
        }
      ],
      paths: {
        jquery: 'vendor/jquery/jquery',
        'jquery-debounce': 'vendor/jquery-debounce/jquery.debounce',
        requirejs: 'vendor/requirejs/require',
        hammerjs: 'vendor/hammerjs/hammer',
        'jquery.cookie': 'vendor/jquery.cookie/jquery.cookie',
        modernizr: 'vendor/modernizr/modernizr',
        pulltorefresh: 'vendor/pulltorefresh/jquery.p2r.min',
        'semantic-ui': 'vendor/semantic-ui/dist/semantic'
      }
    });
  }
  define(function(require, exports, module){
    var jquery, semanticUi, state, stateMachine, middleWares, ui, appSpec, takePhoto, upPhoto, analysis, share, addPhoto, selectMallShop, startAppStateMachine, observeAppState, activateWidgets;
    jquery = require('jquery');
    semanticUi = require('semantic-ui');
    state = require('state');
    stateMachine = require('state/state-machine');
    middleWares = require('middle-wares');
    ui = require('common/ui');
    appSpec = require('app-spec');
    takePhoto = require('widgets/take-photo/take-photo');
    upPhoto = require('widgets/up-photo/up-photo');
    analysis = require('widgets/analysis/analysis');
    share = require('widgets/share/share');
    addPhoto = require('widgets/add-photo/add-photo');
    selectMallShop = require('widgets/select-mall-shop/select-mall-shop');
    startAppStateMachine = function(){
      var appStateMachine;
      appSpec.addStates();
      appStateMachine = new stateMachine({
        "app-page": appSpec.pages
      });
      appStateMachine.addTransitions({
        spec: appSpec.transitions
      });
      appStateMachine.start('select-mall-shop');
    };
    observeAppState = function(){
      var this$ = this;
      state.appPage.observe(function(page){});
    };
    activateWidgets = function(){
      takePhoto.activate();
      analysis.activate();
      upPhoto.activate();
      share.activate();
      addPhoto.activate();
      selectMallShop.activate();
    };
    return middleWares.activate(function(){
      console.log("\n\n*************** at-plus activated! ***************\n\n");
      startAppStateMachine();
      activateWidgets();
      observeAppState();
    });
  });
}).call(this);
