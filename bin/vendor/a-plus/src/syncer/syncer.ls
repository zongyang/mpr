# 职责：将state的状态，同步、传播到远端
define (require, exports, module) -> 
  class Syncer # abstract 
    # 职责：当remote的change在本地local-update时，避免任何其它Syncer，将此变动视为local change emit出去。
    # 原因：syncer监听本地的state，将变动（change）发送出去，同时，收取来自远端的变动，在本地实施。在此实施来自远端的变动时，所有本地state的observers应该被触发，而所有syncers的observers不能被触发。
    # 设计：参考http://my.ss.sysu.edu.cn/wiki/pages/editpage.action 设计难点（避免Syncers自激互激）
    @guard-for-not-execute-observers-of-syncers = (observers-update-on-change)!-> # 
      Syncer.is-change-from-syncer = true 
      observers-update-on-change!
      Syncer.is-change-from-syncer = false

    @should-run-local-state-observers-of-syncers = -> not Syncer.is-change-from-syncer

    (@channel, @state)->

    initial: (done)!-> 
      @listen-and-emit-local-state-change! 
      @listen-and-sync-others-state-change! 
      @start-to-answer-others-asking! 
      @start-to-answer-others-reload-asking! if window.is-at-plus-running-as-master!
      @channel.mediate-server-actions?!
      @ask-data !~> @state.initial-data? done

    listen-and-emit-local-state-change: !-> 
      observer = (new-value, o-or-a)!~> @channel.send {new-value: (@marshal new-value), url: window.host-page-url} <<< if @state.is-array then {action: o-or-a} else {old-value: o-or-a}
      observer.should-run = Syncer.should-run-local-state-observers-of-syncers
      if @state.is-array then
        @state.fn.observe observer, observer-type = 'add'
        @state.fn.observe observer, observer-type = 'remove'
      else
        @state.fn.observe observer, observer-type = 'element'

    local-updater: (change, is-global)!~> if (change.url is window.host-page-url or is-global) or (!change.url? and !window.host-page-url) # 后者的条件是给Mobile Web用的，此时，浏览器直接加载@+page，而没有host-page
      new-value = @unmarshal change.new-value 
      Syncer.guard-for-not-execute-observers-of-syncers !~> switch 
        | change.action is 'answer'       =>    @initial-local-data new-value
        | change.action?                  =>    @state.fn[change.action] new-value
        | otherwise                       =>    @state.fn new-value

    initial-local-data: (data)!-> @state.set-value data

    unmarshal: (value)->
      if Array.is-array value then [@create-object-or-primitive element for element in value ] else @create-object-or-primitive value

    create-object-or-primitive: (value)-> if typeof value is 'object' then new @state.unmarshal-constructor value else value


    marshal: (value)->
      marshal-element = (element)-> if element.prepare-for-server then element.prepare-for-server! else element
      if Array.is-array value then [marshal-element element for element in value ] else marshal-element value

    listen-and-sync-others-state-change: !-> @channel.receive @local-updater

    start-to-answer-others-asking: !-> @channel.answer? @asking-handle # initial-data也是一种change

    start-to-answer-others-reload-asking: !->
      # master的web-channel去reload完数据后，不只是要通知 slave 的tabs-channel，自己也要更新数据
      if @channel.answer-reload and window.is-at-plus-running-as-master! then
        @channel.answer-reload !(data)~> @local-updater data, true

    asking-handle: (callback)!~> callback value: new-value: (@marshal @state.fn!), url: window.host-page-url

    ask-data: (done)!-> 
      @state.has-not-answered = true # 开始ask。has-not-answered有3个状态：null（不在ask-data活动中）| true（开始ask，还未得到答案） | false（得到了答案）
      @channel.ask (initial-data)!~> 
        @local-updater initial-data.value, @channel.is-global if initial-data.result is 'success'
        @state.has-not-answered = null
        done?!

    reload-data: (done, is-global=true)!-> 
      @channel.is-reload = true
      @channel.reload (data)!~> 
        @local-updater data.value, is-global
        done!



    execute-server-action: ({action, id, new-value, callback})!-> 
      is-tabs-syncer = true if @channel.next
      if window.is-at-plus-running-as-master!
        url = window.host-page-url
        channel = if is-tabs-syncer then @channel.next else @channel # 多tabs环境时，用的是tabs syncer，否则只用web syncer。
        channel.messenger.emit "#{@state.name}-#{action}", {id, url, new-value}, (error, result)!~>  
          Syncer.guard-for-not-execute-observers-of-syncers !~> callback? error, @unmarshal result
      else
        @channel.messenger.on (@channel.get-event "receive-server-action-result-#{action}"), ({url, new-value})!~> 
          Syncer.guard-for-not-execute-observers-of-syncers !~> callback? new-value.error, @unmarshal new-value.result
        @channel.messenger.emit (@channel.get-event "send-server-action-#{action}"), {url: window.host-page-url, id, new-value}
        
