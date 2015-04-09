require! {express, http, path , multer, fs, morgan:logger,'socket.io', './host-config', 'cookie-parser'
'body-parser','./router/admin','./router/index'}

end-server-url = host-config.end-server.url 

app = express!
server = http.create-server app
io = socket.listen server, resource: (host-config.path or '.') + '/socket.io'


app.use logger 'dev'
app.set 'views', __dirname
app.set 'view engine', 'jade'
app.use cookie-parser!
app.use body-parser.json!
app.use body-parser.urlencoded { extended: false }
#app.use '/admin' multer {dest: './temp/images'}
app.use app.router
   .use express.static(__dirname, max-age: a-day = 24 * 60 * 60)
   .use '/admin', admin app.router
sessions = {}

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

exports = module.exports = server
exports.use = -> app.use.apply app, &  