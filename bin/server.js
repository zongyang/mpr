// Generated by LiveScript 1.3.1
(function(){
  var express, http, path, socket, hostConfig, getRandomKey, addIds, comments, newComments, oldComments, app, server, io, aDay, getOldComments, startEmulatingNewComments, sessions;
  express = require('express');
  http = require('http');
  path = require('path');
  socket = require('socket.io');
  hostConfig = require('./host-config');
  getRandomKey = function(){
    return '' + Date.now() + Math.random();
  };
  addIds = function(comments){
    var i$, len$, comment;
    for (i$ = 0, len$ = comments.length; i$ < len$; ++i$) {
      comment = comments[i$];
      comment.id = getRandomKey();
    }
    return comments;
  };
  comments = addIds(require('./data'));
  newComments = comments.slice(0, 200);
  oldComments = comments.slice(200, comments.length);
  app = express();
  server = http.createServer(app);
  io = socket.listen(server, {
    resource: (hostConfig.path || '.') + '/socket.io'
  });
  app.use(app.router).use(express['static'](__dirname, {
    maxAge: aDay = 24 * 60 * 60
  }));
  app.get('/api/comments.json', function(req, res){
    res.json(getOldComments(0, 30));
  });
  getOldComments = function(from, _to){
    console.log("old-comments are requested for " + from + " -- " + _to);
    switch (false) {
    case !(from >= oldComments.length):
      return {
        end: oldComments.length
      };
    case _to !== 1000:
      return oldComments;
    case !(_to >= oldComments.length):
      return oldComments.slice(from, oldComments.length);
    default:
      return oldComments.slice(from, _to);
    }
  };
  startEmulatingNewComments = function(socket){
    var i, threshold, timer, newCommentPumper;
    i = 0;
    threshold = 25;
    timer = null;
    newCommentPumper = function(){
      var nm;
      if (timer) {
        clearTimeout(timer);
      }
      i = (i + 1) % newComments.length;
      socket.emit('new-comment', nm = newComments[Math.floor(Math.random() * 200)]);
      if (0 < (threshold = threshold - 1)) {
        timer = setTimeout(newCommentPumper, Math.random() * 10000);
      }
    };
    newCommentPumper();
  };
  sessions = {};
  io.on('connection', function(socket){
    var usersOnPage;
    console.log("connected!");
    socket.on('request-initial', function(sessionId){
      var i$, ref$, len$, url, data;
      console.log("typeof session-id: " + typeof sessionId + ", session-id: ", sessionId);
      if (sessionId && sessions[sessionId]) {
        for (i$ = 0, len$ = (ref$ = sessions[sessionId].urls).length; i$ < len$; ++i$) {
          url = ref$[i$];
          socket.join(url);
        }
      } else {
        sessionId = Date.now() + Math.random();
        sessions[sessionId] = {
          urls: []
        };
        console.log("assign new session-id: ", sessionId);
      }
      socket.emit('response-initial', data = {
        user: {
          username: 'abc',
          avatar: 'ddd'
        },
        sessionId: sessionId
      });
    });
    socket.on('ask-comments', function(arg$, callback){
      var url, sessionId, error;
      url = arg$.url, sessionId = arg$.sessionId;
      console.log("typeof session-id: " + typeof sessionId + ", session-id: ", sessionId);
      socket.join(url);
      console.log("\n\n*************** join " + url + " ***************\n\n");
      sessions[sessionId].urls.push(url);
      callback(error = null, {
        url: url,
        newValue: getOldComments(0, 200),
        action: 'answer'
      });
    });
    socket.on("comments-add-likes", function(arg$, callback){
      var id, url, data, sessionId;
      id = arg$.id, url = arg$.url, data = arg$.data, sessionId = arg$.sessionId;
      console.log("\n\n*************** id: " + id + ", url: " + url + ", data: " + data + " ***************\n\n");
      callback(null, {
        result: 'success'
      });
    });
    socket.on('ask-messages', function(arg$, callback){
      var url, sessionId, error;
      url = arg$.url, sessionId = arg$.sessionId;
      console.log("\n\n*************** ask-messages ***************\n\n");
      callback(error = null, {
        url: url,
        newValue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        action: 'answer'
      });
    });
    socket.on('ask-current-user', function(arg$, callback){
      var url, sessionId, error;
      url = arg$.url, sessionId = arg$.sessionId;
      console.log("\n\n*************** ask-current-user ***************\n\n");
      callback(error = null, {
        url: url,
        newValue: {
          name: '我是Eric'
        },
        action: 'answer'
      });
    });
    socket.on("current-user-login", function(arg$, callback){
      var id, url, data, sessionId, result;
      id = arg$.id, url = arg$.url, data = arg$.data, sessionId = arg$.sessionId;
      console.log("\n\n*************** current-user-login ***************\n\n");
      result = data === '超人' ? 'success' : 'failure';
      callback(null, {
        result: result,
        name: '超人'
      });
    });
    usersOnPage = 10;
    socket.on('add-comments', function(arg$){
      var url, newValue, action;
      url = arg$.url, newValue = arg$.newValue, action = arg$.action;
      console.log("add comment: " + newValue.content + ", url: " + url);
      socket.broadcast.to(url).emit('new-comments', {
        url: url,
        newValue: newValue,
        action: action
      });
    });
    socket.on('update-element-of-comments', function(arg$){
      var url, newValue, action;
      url = arg$.url, newValue = arg$.newValue, action = arg$.action;
      console.log("update element of comments, id is: " + newValue.id + ", content: " + newValue.content);
      socket.broadcast.to(url).emit('updated-element-of-comments', {
        url: url,
        newValue: newValue,
        action: action
      });
    });
    socket.on('ask-info-bar-data', function(arg$, callback){
      var url, error;
      url = arg$.url;
      console.log("ask-info-bar-data, url: " + url);
      callback(error = null, {
        url: url,
        newValue: {
          user: usersOnPage,
          comment: 20,
          posted: 3,
          like: 4
        },
        action: 'answer'
      });
    });
    socket.on('update-info-bar-data', function(arg$){
      var url, newValue, action;
      url = arg$.url, newValue = arg$.newValue, action = arg$.action;
      usersOnPage = newValue.user;
      console.log("update info-bar-data, users-on-page: " + usersOnPage);
      socket.broadcast.to(url).emit('updated-info-bar-data', {
        url: url,
        newValue: newValue
      });
    });
  });
  server.listen(hostConfig.endServer.port, function(){
    console.log('listen', hostConfig.endServer.port);
  });
}).call(this);
