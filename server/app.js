var express = require('express');
var path = require('path');
var http=require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var hostConfig = require('./host-config');
var endServerUrl = hostConfig.endServer.url;

var addPhoto = require('./routes/add-photo');
var app = express();
var sessions = {};
// view engine setup
app.set('views', __dirname);
app.set('view engine', 'jade');

//server
var server=http.createServer(app);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express['static'](__dirname, {
  maxAge: aDay = 24 * 60 * 60
}));


//app.use(express.static(path.join(__dirname, 'public')));
//路由
app.use('/add-photo', addPhoto);




//socket.io
var io = socket.listen(server, {
  resource: (hostConfig.path || '.') + '/socket.io'
});

io.on('connection', function(socket) {
  console.log("connected!");
  socket.on('request-initial', function(sessionId) {
    var i$, ref$, len$, room, data;
    console.log("typeof session-id: " + typeof sessionId + ", session-id: ", sessionId);
    if (sessionId && sessions[sessionId]) {
      for (i$ = 0, len$ = (ref$ = sessions[sessionId].rooms).length; i$ < len$; ++i$) {
        room = ref$[i$];
        socket.join(room);
      }
    } else {
      sessionId = Date.now() + Math.random();
      sessions[sessionId] = {
        rooms: []
      };
      console.log("assign new session-id: ", sessionId);
    }
    socket.emit('response-initial', data = {
      user: {
        username: 'abc',
        role: 'visitor'
      },
      sessionId: sessionId
    });
  });
});

server.listen(hostConfig.port);
module.exports = app;