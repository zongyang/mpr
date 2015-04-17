# 职责：传播状态的变化（change）
# 设计：重点在于connect之后，current channel与previous、next之间的合作，参见：http://my.ss.sysu.edu.cn/wiki/pages/viewpage.action?pageId=354975813
define (require, exports, module) -> 
  require! ['state', 'host-config', './channel', './socket-adapter']

  class Web-channel extends channel

    @is-activated = false
    @role = 'slave' # master | slave

    @master-slave-switcher = (master-handler, slave-handler)!->
      if window.is-at-plus-running-as-master! then master-handler! else slave-handler!
      window.is-at-plus-running-as-master.observe (is-master)!~>
        if is-master then (master-handler! if @role is 'slave') else (slave-handler! if @role is 'master')

    @activate = (done)!-> @master-slave-switcher !~> 
      @role = 'master' ; socket-adapter.connect-server    (current-user)!~> @activation-callback !-> done current-user, is-master = true
    , !~>
      @role = 'slave'  ; socket-adapter.disconnect-server !~> @activation-callback done

    @activation-callback = (done)!-> (@is-activated = true ; done!) if not @is-activated

    ->
      super ...
      @messenger =  socket-adapter

    send: (change)!~> if @@@role is 'master'
      @messenger.emit "add-#{@state.name}"              , change  if change.action is "add"
      @messenger.emit "update-element-of-#{@state.name}", change  if change.action is "update-element"
      @messenger.emit "remove-#{@state.name}"           , change  if change.action is "remove"
      @messenger.emit "update-#{@state.name}"           , change  if not change.action
      # console.error "unimplemented action: #{change.action}"    if change.action? and change.action not in <[ add update-element remove ]>

    receive: (callback)!~> if @@@role is 'master'
      @messenger.on "new-#{@state.name}", (change)!~> callback change, @state.is-global ; @previous?.send change
      @messenger.on "updated-element-of-#{@state.name}", (change)!~> callback change, @state.is-global ; @previous?.send change
      @messenger.on "partial-updated-element-of-#{@state.name}", (change)!~> callback change, @state.is-global ; @previous?.send change
      @messenger.on "updated-#{@state.name}", (change)!~> callback change, @state.is-global ; @previous?.send change
      @messenger.on "change-id-#{@state.name}", (change)!~> callback change, @state.is-global ; @previous?.send change # 此消息为create-element之后，服务端将原来临时的客户端id变更为永久服务端id后，发出的消息。

    ask: (callback, url)!-> 
      if @@@role is 'master' 
        super "ask-#{@state.name}", null, callback, url
        # super "ask-#{@state.name}", "answer-#{@state.name}", callback, url
      else
        callback result: 'slave-dont-ask-data-via-web-channel'

    answer: null # Web channel由server answer，故而并不需要answer

    reload: !-> if @@@role is 'master'
      super "ask-#{@state.name}", null, @local-updater, window.host-page-url
      # slave don't reload via web channel

    handle-server-action: ({url, id, action, state, new-value})->
      @messenger.emit "#{state}-#{action}", {id, url, new-value}, (error, result)!~>
        @previous.messenger.emit (@previous.get-event "receive-server-action-result-#{action}"), {url, new-value: {error, result}}
    