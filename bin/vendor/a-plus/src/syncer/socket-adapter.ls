# 职责：和服务器对接，事件转换。
define (require, exports, module) -> 
  require! ['state', 'host-config', './channel', 'jquery.cookie']
  socket: null

  error-message: null

  initial-socket: !(callback)-> if @socket then
    @session-id = $.cookie 'sid' # 直接用cookie
    response-initial-handler = (initial-data)~>
      callback? initial-data
      @socket.remove-listener 'response-initial', response-initial-handler
    @socket.on 'response-initial', response-initial-handler
    @socket.emit 'request-initial', @session-id

  connect-server: (callback)!->
    options =
      reconnection: true
      reconnectionDelay: 1000ms
    if host-config.is-using-mediate-server then
      @socket = io host-config.name, options # socket、role为类变量，为多个syncer共享。
    else
      @socket = io host-config.end-server.url, options

    @socket.on 'connect_error', !~>
      @error-message = "Unable to connect server, please try again later"

    @socket.on 'reconnect_error', !~>
      @error-message = "Network unavailable, please check your network connection"

    @socket.on 'reconnect_attempt', !~>
      @error-message = "it's trying to reconnect, please try again later"

    @socket.on 'reconnecting', !~>
      @error-message = "it's trying to reconnect, please try again later"

    @socket.on 'reconnect', !~>
      # 重新连接时必须再次初始化，并且重置 error-message
      @initial-socket !~> @error-message = null

    # 这里开始第一次连接时的初始化
    @initial-socket !({user, session-id})~>
      @session-id = session-id
      if not $.cookie 'sid' then $.cookie 'sid', session-id, path: '/' # session-id存到cookie 
      callback? user

  disconnect-server: (callback)!-> @socket?.disconnect! ; @socket = null ; callback!

  emit: (event, change, callback)!->
    if @error-message then
      # 如果socket此时有错误，直接返回错误，setTimeout是为了保持异步
      <~! set-timeout _, 0
      callback? @error-message
    else
      change.session-id = @session-id ; @socket.emit event, change, callback

  on: (event, callback)!->
    @socket.on event, (data)!-> callback data
