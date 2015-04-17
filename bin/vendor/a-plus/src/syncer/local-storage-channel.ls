# 职责：传播状态的变化（change）
# 设计：重点在于connect之后，current channel与previous、next之间的合作，参见：http://my.ss.sysu.edu.cn/wiki/pages/viewpage.action?pageId=354975813
define (require, exports, module) -> 
  require! ['local-storage-manager', './channel']

  class Local-storage-channel extends channel
    (name, state, server-actions, @is-global)->
      super name, state, server-actions
      @messenger = local-storage-manager

    is-for-all-url: -> @is-global or window.is-at-plus-running-as-master!

    send: (change)!~> @messenger.emit (@get-event 'update'), change

    receive: (callback)!~> 
      event = @get-event 'update', @is-for-all-url
      @messenger.on event, (change)!~>
        @next?.send change ; callback change, @is-global ; @previous?.send change

    get-event: (type)-> 
      event = super type
      event.is-for-all-url = ~> @is-for-all-url!
      event

    ask: (callback)!-> super (@get-event 'ask'), (@get-event 'answer'), callback

    reload: (callback)!-> if not window.is-at-plus-running-as-master! # only slave mediated reload to master
      @add-answer-handler (@get-event 'reload-answer'), callback
      @messenger.emit @get-event 'reload-ask'

    answer-reload: !(callback)-> 
      @messenger.on (@get-event 'reload-ask'), ({url})!~> 
        @next.ask (data)!~> 
          if callback then callback data.value # 更新master数据
          @messenger.emit (@get-event 'reload-answer'), data.value # 通知slave去更新数据
        , url

    mediate-server-actions: !-> [@mediate-server-action action for action in @server-actions]

    mediate-server-action: (action)!-> # 注意！！！，这里要改进，现在利用了tabs channel的next是web！！！
      @messenger.on (@get-event "send-server-action-#{action}"), ({url, id, new-value})!~>
        @next.handle-server-action {url, id, action, state: @state.name, new-value}
        
