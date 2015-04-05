# @+ 入口脚本，requireJS从这里开始加载@+应用的JavaScript。
if require.config
  require.config {
    baseUrl: '.' 
    packages: [
      {
        name: 'host-config'
        main: 'host-config.js'
        location: '..'
      },
      {
        name: 'util'
        main: 'util.js'
        location: '../vendor/a-plus/bin'
      },
      {
        name: 'state'
        main: 'state.js'
        location: '../vendor/a-plus/bin/state'
      },
      {
        name: 'data'
        main: 'data-manager.js'
        location: '../vendor/a-plus/bin/data'
      },
      {
        name: 'syncers-factory'
        main: 'syncers-factory.js'
        location: '../vendor/a-plus/bin/syncer'
      },
      {
        name: 'local-storage-manager'
        main: 'local-storage-manager.js'
        location: '../vendor/a-plus/bin'
      },
      {
        name: 'middle-wares'
        main: 'middle-wares.js'
        location: 'common'
      },
      {
        name: 'all-data'
        main: 'data-spec.js'
        location: '.'
      },
      {
        name: 'semantic-ui' 
        main: 'semantic.js'       
        location: '../vendor/semantic-ui/dist'
      }
    ]
  } 

define (require, exports, module) ->
  require!  <[ jquery  semantic-ui state state/state-machine middle-wares common/ui app-spec
              widgets/take-photo/take-photo
              widgets/up-photo/up-photo
              widgets/analysis/analysis
              widgets/share/share
              widgets/add-photo/add-photo 
            ]>

  start-app-state-machine = !->
    app-spec.add-states!
    app-state-machine = new state-machine "app-page": app-spec.pages 
    app-state-machine.add-transitions spec: app-spec.transitions
    app-state-machine.start 'add-photo'
    

  observe-app-state =!->
    state.app-page.observe (page)!~>
      #$ '#'+page .add-class 'show'
      
  activate-widgets =!->
    take-photo.activate!
    analysis.activate!
    up-photo.activate!
    share.activate!
    add-photo.activate!
    #splash.activate!
    #top-bar.activate!
    # notification.activate!
    #main.activate! # 包括了mine, comment, topic, 3个子widgets。TODO：更名为main-carousel
    #notification-bubble.activate!
    #sign.activate!

  # require! <[ jquery middle-wares hall at-plus-button/button control-ring/control-ring input-bar/input-bar top-bar/top-bar info/info ]>
  # window.start-at-plus = !-> middle-wares.activate !->
  middle-wares.activate !->
    console.log "\n\n*************** at-plus activated! ***************\n\n"
    start-app-state-machine!
    activate-widgets!
    observe-app-state!
    #start-app-state-machine!
    #activate-widgets!
    #ui.enable-back-navigation!
    #console.log "\n\n*************** at-plus activated! ***************\n\n"
