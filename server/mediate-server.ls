require! {express, http, path , multer, fs, 'socket.io', './host-config', 'cookie-parser'}

end-server-url = host-config.end-server.url 

app = express!
server = http.create-server app
io = socket.listen server, resource: (host-config.path or '.') + '/socket.io'

app.set 'views', __dirname
app.set 'view engine', 'jade'
app.use cookie-parser!
app.use multer {dest: './temp/images'}
app.use app.router .use express.static(__dirname, max-age: a-day = 24 * 60 * 60)

sessions = {}
urls-patterns-of-web-pages-with-at-plus-mashup = [/^http:\/\/localhost:8080\/stub\.html/]

app.get '/api/comments.json', (req, res)!-> res.json comments

app.post '/api/pictures', (req, res)!-> 
  # console.log " req.body: ", req.body
  # console.log " req.files: ", req.files
  for comment-id, file of req.files
    fs.rename file.path, 'bin/' + (get-comment-picture-name comment-id) , (error)!-> console.log "rename erorr: ", error if error
  
get-comment-picture-name = (comment-id)->
  'public/images/' + comment-id

get-random-key = -> '' + Date.now! + Math.random!

prepare-comments = (comments)->
  [(comment._id = get-random-key!; comment.likes-count = Math.floor Math.random! * 200) for comment in comments]
  comments

get-comment-by-id = (id)->
  console.log "\n\n*************** id: #{id}, comments length: #{comments.length} ***************\n\n"
  [return comment for comment in comments when comment._id is id]

__comments = prepare-comments require './data'
batch = 30
comments = __comments.slice index = __comments.length - batch, __comments.length

get-old-comments = (amount)-> 
  old-comments = __comments.slice index - batch, index 
  comments = old-comments.concat comments
  index -= batch
  old-comments


io.on 'connection', (socket)!->
  console.log "connected!" 

  socket.on 'request-initial', (session-id)!->
    console.log "typeof session-id: #{typeof session-id}, session-id: ", session-id
    if session-id and sessions[session-id]
      [socket.join room for room in sessions[session-id].rooms]
    else
      session-id = Date.now! + Math.random! 
      sessions[session-id] = rooms: []
      console.log "assign new session-id: ", session-id
    socket.emit 'response-initial', data = 
      user: {username: 'abc', role: 'visitor'}
      session-id: session-id

  socket.on 'ask-comments', ({url, session-id}, callback)!->
    room = url || 'default'
    console.log "typeof session-id: #{typeof session-id}, session-id: ", session-id
    socket.join room
    console.log "\n\n*************** join #{room} ***************\n\n"
    sessions[session-id].rooms.push room
    callback error = null, {
      url: url
      new-value: comments
      action: 'answer'
    }

  socket.on "comments-add-likes", ({id, url, new-value, session-id}, callback)!->
    room = url || 'default'
    console.log "\n\n*************** id: #{id}, url: #{url}, new-value: #{new-value} ***************\n\n"
    comment = get-comment-by-id id
    if comment
      likes = comment.likes-count += 1 
      socket.broadcast.to room .emit 'partial-updated-element-of-comments', {url, new-value: {id, likes}, action: 'partial-updated-element'}
      callback null, result: 'success'

  socket.on "comments-ask-old-comments", ({id, url, new-value, session-id}, callback)!->
    comments = get-old-comments amount = new-value
    callback null, comments

  # socket.on 'ask-messages', ({url, session-id}, callback)!->
  #   console.log "\n\n*************** ask-messages ***************\n\n"
  #   callback error = null, {
  #     url: url
  #     new-value: [1 to 18]
  #     action: 'answer'
  #   }

  # socket.on 'ask-current-user', ({url, session-id}, callback)!->
  #   console.log "\n\n*************** ask-current-user ***************\n\n"
  #   callback error = null, {
  #     url: url
  #     new-value: name: '我是Eric'
  #     action: 'answer'
  #   }

  socket.on "current-user-login", ({new-value, session-id}, callback)!->
    console.log "\n\n*************** current-user-login ***************\n\n"
    result = if new-value.name is 'watermelon' then 'success' else 'failure'
    if result is 'success'
      new-value.id = '26bd299e-19c3-4c09-9a5b-1fb829ce4bf7'
      new-value.username = new-value.name
      new-value.role = 'logged-user'
      new-value.account-state = 'waiting-confirmation'
      new-value.email = 'watermelon@qq.com'
      new-value.comments-count = 0
      new-value.likes-count = 0
      new-value.avatar = 'assets/images/avatars/default01.png'
      delete new-value.name
      delete new-value.password
      callback null, {new-value, session-id}
    else
      callback "error", null

  socket.on "current-user-logout", ({new-value, session-id}, callback)!->
    console.log "\n\n*************** current-user-logout ***************\n\n"
    new-value.id = '26bd299e-19c3-4c09-9a5b-1fb829ce4'
    new-value.role = 'visitor'
    new-value.username = '游客'
    new-value.account-state = 'normal'
    new-value.email = '只有未激活用户才会显示邮箱'
    new-value.comments-count = 0
    new-value.likes-count = 0
    callback null, {new-value, session-id}

  socket.on "current-user-check-username", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-check-username ***************\n\n"
    result = if new-value.username isnt 'watermelon' then 'success' else 'failure'
    if result is 'success'
      callback null, null
    else
      callback "error", null

  socket.on "current-user-check-email", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-check-email ***************\n\n"
    result = if new-value.email isnt 'watermelon@qq.com' then 'success' else 'failure'
    if result is 'success'
      callback null, null
    else
      callback "error", null

  socket.on "current-user-register", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-register ***************\n\n"
    new-value.role = 'logged-user'
    new-value.account-state = 'waiting-confirmation'
    new-value.comments-count = 0
    new-value.likes-count = 0
    callback null, {new-value}

  socket.on "update-current-user", ({new-value})!->
    console.log "\n\n*************** update-current-user ***************\n\n", new-value

  socket.on "current-user-resend-email", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-resend-email ***************\n\n"
    callback null, null

  socket.on "current-user-find-password", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-find-password ***************\n\n"
    if new-value.email is 'watermelon@qq.com' then (callback null, null) else (callback 'error', 'invaild email')

  socket.on "current-user-check-code", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-check-code ***************\n\n"
    if new-value.code is '123' then (callback null, null) else callback 'error', null

  socket.on "current-user-change-password", ({new-value}, callback)!->
    console.log "\n\n*************** current-user-change-password ***************\n\n"
    callback null, null

  # (room) <-! socket.on 'join-room'
  # socket.join room
  users-on-page = 10
  socket.on 'add-comments', ({url, new-value, action})!->
    comment = new-value
    room = url || 'default'
    console.log "add comment: room: #{room}, #{new-value.textContent}, url: #{url}, new-value: ", new-value
    change-local-picture-with-server-picture new-value
    comment.likes-count = 0
    comments.push comment
    socket.broadcast.to room .emit 'new-comments', {url, new-value, action}

  socket.on 'update-element-of-comments', ({url, new-value, action})!->
    console.log "update element of comments, id is: #{new-value.id}, content: #{new-value.content}" 
    socket.broadcast.to url .emit 'updated-element-of-comments', {url, new-value, action}

  # socket.on 'ask-info-bar-data', ({url}, callback)!->
  #   console.log "ask-info-bar-data, url: #{url}"
  #   callback error = null, {url, new-value: {user: users-on-page, comment: 20, posted: 3, like: 4 }, action: 'answer'}

  # socket.on 'update-info-bar-data', ({url, new-value, action})!->
  #   users-on-page := new-value.user
  #   console.log "update info-bar-data, users-on-page: #{users-on-page}" 
  #   socket.broadcast.to url .emit 'updated-info-bar-data', {url, new-value}

change-local-picture-with-server-picture = (comment)!->
  # console.log "comment picture: ", comment.picture
  comment.picture = (get-comment-picture-name comment._id)   if comment.picture?

exports = module.exports = server
exports.use = -> app.use.apply app, &  