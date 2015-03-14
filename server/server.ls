require! {express, http, path, 'socket.io', './host-config'}

get-random-key = -> '' + Date.now! + Math.random!

add-ids = (comments)->
  [comment.id = get-random-key! for comment in comments]
  comments


comments = add-ids require './data'
new-comments = comments.slice 0, 200
old-comments = comments.slice 200, comments.length

app = express!
server = http.create-server app
io = socket.listen server, resource: (host-config.path or '.') + '/socket.io'
app.use app.router .use express.static(__dirname, max-age: a-day = 24 * 60 * 60)

app.get '/api/comments.json', (req, res)!-> res.json get-old-comments 0, 30

get-old-comments = (from, _to)->
  console.log "old-comments are requested for #{from} -- #{_to}" 
  switch
  | from  >= old-comments.length => end: old-comments.length
  | _to   is 1000                => old-comments # 仅仅是测试用
  | _to   >= old-comments.length => old-comments.slice from, old-comments.length
  | otherwise                    => old-comments.slice from, _to

start-emulating-new-comments = (socket)!->
  i = 0 ; threshold = 25; timer = null
  new-comment-pumper = !->
    # console.log "timer is: ", timer
    clear-timeout timer if timer 
    # console.log "cleared timer is: ", timer
    # if new-comments.length > 0
    i := (i + 1) % new-comments.length
    socket.emit 'new-comment', nm = new-comments[Math.floor (Math.random! * 200)]
    # console.log "emit new comment #{nm.content} at index: #{i}"
    timer := set-timeout new-comment-pumper, Math.random! * 10000  if 0 < threshold := threshold - 1
  new-comment-pumper! 

sessions = {}

io.on 'connection', (socket)!->
  console.log "connected!" 
  # start-emulating-new-comments socket
  # (data) <-! socket.on 'request-comments'
  # socket.emit 'comments', get-old-comments data.from, data.to

  socket.on 'request-initial', (session-id)!->
    console.log "typeof session-id: #{typeof session-id}, session-id: ", session-id
    if session-id and sessions[session-id]
      [socket.join url for url in sessions[session-id].urls]
    else
      session-id = Date.now! + Math.random! 
      sessions[session-id] = urls: []
      console.log "assign new session-id: ", session-id
    socket.emit 'response-initial', data = 
      user: {username: 'abc', avatar: 'ddd'}
      session-id: session-id

  socket.on 'ask-comments', ({url, session-id}, callback)!->
    console.log "typeof session-id: #{typeof session-id}, session-id: ", session-id
    socket.join url
    console.log "\n\n*************** join #{url} ***************\n\n"
    sessions[session-id].urls.push url
    callback error = null, {
      url: url
      new-value: get-old-comments 0, 200
      action: 'answer'
    }

  socket.on "comments-add-likes", ({id, url, data, session-id}, callback)!->
    console.log "\n\n*************** id: #{id}, url: #{url}, data: #{data} ***************\n\n"
    callback null, result: 'success'

  socket.on 'ask-messages', ({url, session-id}, callback)!->
    console.log "\n\n*************** ask-messages ***************\n\n"
    callback error = null, {
      url: url
      new-value: [1 to 18]
      action: 'answer'
    }

  socket.on 'ask-current-user', ({url, session-id}, callback)!->
    console.log "\n\n*************** ask-current-user ***************\n\n"
    callback error = null, {
      url: url
      new-value: name: '我是Eric'
      action: 'answer'
    }

  socket.on "current-user-login", ({id, url, data, session-id}, callback)!->
    console.log "\n\n*************** current-user-login ***************\n\n"
    result = if data is '超人' then 'success' else 'failure'
    callback null, {result: result, name: '超人'}



  # (room) <-! socket.on 'join-room'
  # socket.join room
  users-on-page = 10
  socket.on 'add-comments', ({url, new-value, action})!->
    console.log "add comment: #{new-value.content}, url: #{url}"
    socket.broadcast.to url .emit 'new-comments', {url, new-value, action}

  socket.on 'update-element-of-comments', ({url, new-value, action})!->
    console.log "update element of comments, id is: #{new-value.id}, content: #{new-value.content}" 
    socket.broadcast.to url .emit 'updated-element-of-comments', {url, new-value, action}

  socket.on 'ask-info-bar-data', ({url}, callback)!->
    console.log "ask-info-bar-data, url: #{url}"
    callback error = null, {url, new-value: {user: users-on-page, comment: 20, posted: 3, like: 4 }, action: 'answer'}

  socket.on 'update-info-bar-data', ({url, new-value, action})!->
    users-on-page := new-value.user
    console.log "update info-bar-data, users-on-page: #{users-on-page}" 
    socket.broadcast.to url .emit 'updated-info-bar-data', {url, new-value}


server.listen host-config.end-server.port, !-> console.log 'listen', host-config.end-server.port

# exports = module.exports = server
# exports.use = -> app.use.apply app, &  