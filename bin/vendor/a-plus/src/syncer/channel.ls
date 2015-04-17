# 职责：传播状态的变化（change）
# 设计：重点在于connect之后，current channel与previous、next之间的合作，参见：http://my.ss.sysu.edu.cn/wiki/pages/viewpage.action?pageId=354975813
define (require, exports, module) -> 
  class Channel
    @waiting-for-asking-next-channel-time = 2000ms
    
    (@name, @state, @server-actions)->

    get-event: (type)-> {channel: @name, state: @state.name, type}

    connect: (next)!-> @next = next; next.previous = @

    update: (change)!-> @next?.send change ; @local-update? change

    ask: (ask-event, answer-event, answer-handler, url)!-> let answer-handler = answer-handler, url = url
      if is-mobile-web-version = window.current-location
        ask-param = {location: window.current-location}
        @@@waiting-for-asking-next-channel-time = 0 # 直接ask web，不用等待tabs
      else # DW版本
        ask-param = url: if @is-passing-asking url then url else window.host-page-url
      is-answered = false
      if answer-event 
        if window.is-on-extension-background-page then
          # 这里如果让 tabs-channel 去ask，tabs-channel 会比 web-channel更早调用 handle-answer-data 方法
          # 这会导致 web-channel 再次调用 handle-answer-data 方法时不会调用 answer-handler，从而初始化失败
          clear-timeout @waiting-for-asking-next-channel-timer
          answer-handler result: "插件master的tabs-channel不需要去ask"
        else
          @add-answer-handler answer-event, answer-handler 
          @messenger.emit ask-event, ask-param if @should-ask url # master代理其它页面询问
      else # 无answer-event，直接执行ask-event的回调函数
        if @should-ask url
          @messenger.emit ask-event, ask-param, (error, data)!~>
            throw error if error
            if not is-answered
              is-answered := true # 避免多次处理来自多个tab的回答
              @handle-answer-data data, (@is-passing-asking data.url), answer-handler

      @waiting-for-asking-next-channel-timer = set-timeout (!~> @try-asking-via-next answer-handler, url), @@@waiting-for-asking-next-channel-time

    should-ask: (url)-> @state.has-not-answered or (@is-passing-asking url)


    add-answer-handler: do -> 
      added-answer-events = []
      (answer-event, answer-handler)!->
        event-str = JSON.stringify answer-event
        if event-str not in added-answer-events
          # console.log "add answer for #{JSON.stringify answer-event}"
          added-answer-events.push event-str
          @messenger.on answer-event,  (data)!~> @handle-answer-data data, (@is-passing-asking data.url), answer-handler
        else 
          # console.log "duplicated answer-event handler for #{event-str} doesn't added"

    is-passing-asking: (url)-> not @is-global and (url? and url isnt window.host-page-url)

    handle-answer-data: (data, is-passing, answer-handler)!->
      # console.log "channel #{@name} answer initial-data of #{@state.name}."
      clear-timeout @waiting-for-asking-next-channel-timer
      if @state.has-not-answered is null or @state.has-not-answered or is-passing or @is-reload # passing-asking的时候，原来channel的initial回调还在，实际上就有两次执行这部分函数，所以要加这个判断。
        answer-handler value: data, result: 'success' 
      @state.has-not-answered = false if not is-passing
      @is-reload = false

    try-asking-via-next: (answer-handler, url)!~>
      # console.log "channel #{@name} doesn't answer initial-data of #{@state.name}."

      if @next and @state.has-not-answered
        # console.log "we are going to try intial-data of #{@state.name} through #{@next.name} channel" 
        @next.ask answer-handler, url
      else if not @state.has-not-answered
        # console.log "but data of #{@state.name} has already been initialed."
        answer-handler result: 'already-initialed'
      else
        answer-handler result: 'failed-initial-data'

    answer: (_asking-handler)!-> @messenger.on (@get-event 'ask'), ({url})!~>
      asking-handler = if @is-passing-asking url then @get-answer-from-next else _asking-handler # reload的时候，global也要再次从服务器（web channel）拿回。
      asking-handler (!~> @emit-answer ...), url

    get-answer-from-next: (answer-handler, url)!~> @next.ask answer-handler, url

    emit-answer: (initial-data)!~> @messenger.emit (@get-event 'answer'), initial-data.value 
