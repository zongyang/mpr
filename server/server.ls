require! {express, http, path, 'socket.io', './host-config'}

app = express!
server = http.create-server app
io = socket.listen server, resource: (host-config.path or '.') + '/socket.io'
app.use app.router .use express.static(__dirname, max-age: a-day = 24 * 60 * 60)

app.get '/api/comments.json', (req, res)!-> res.json get-old-comments 0, 30



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

 
server.listen host-config.end-server.port, !-> console.log 'listen', host-config.end-server.port

# exports = module.exports = server
# exports.use = -> app.use.apply app, &  