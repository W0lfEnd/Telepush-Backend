var express = require('express');
var app = express();
var db = require('./middleware/db');

global.__root   = __dirname + '/';
app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require(__root + 'middleware/auth/AuthController');
app.use('/api', AuthController);

var UserController = require(__root + 'api/users/UserController');
app.use('/api', UserController);

var ChatController = require(__root + 'api/chat/ChatController');
app.use('/api/chat', ChatController);

module.exports = app;