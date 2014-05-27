'use strict';

const
	express = require('express'),
	http    = require('http'),
	routes  = require('./routes/index'),
	path    = require('path'),
	app	    = express(),
	socket  = require('socket.io'),
	_       = require('underscore'),
	userColors = ['black', 'red', 'green', 'blue'];

app.set('port', 3000);
app.set('views', path.join(__dirname + '/public/views'));
app.set('view engine', 'jade');

app.use('/', routes);
app.use(express.static(path.join(__dirname + '/public')));

var
	users = [],
	server = http.createServer(app).listen(app.get('port'), function () {
		console.log("Express server listening on port " + app.get('port'));
	}),
	io = socket.listen(server);

io.sockets.on('connection', function (socket) {
	onConnection(socket);

	socket.on('disconnect', function () {
		onDisconnect(socket);
	});

	socket.on('changeUsername', function (data) {
		onChangeUsername(socket, data);
	});

	socket.on('sendMessage', function (data) {
		onSendMessage(data);
	})
});

function onConnection(socket) {
	var id = generateId(),
		user = {
			socket: socket,
			user: {
				id: id,
				username: "user" + id,
				messages: []
			}
		}

	users.push(user);

	var userObjs = [];
	for (var i = 0; i < users.length; i++) {
		userObjs.push(users[i].user);
	}

	io.sockets.emit('userConnected', { user: user.user });
	socket.emit('connectionRes', { user: user.user, users: userObjs });
};

function onDisconnect(socket) {
	var idx = -1;
	for (var i = 0; i < users.length; i++) {
		if (users[i].socket === socket) {
			idx = i;
			break;
		}
	}

	if (idx > -1) {
		var user = users[idx];
		users.splice(idx, 1);

		io.sockets.emit('userDisconnected', { user: user.user });
	}
};

function onChangeUsername(socket, data) {
	var userId = data.userId,
		idx = -1,
		newUsername = data.newUsername,
		nameTaken = false;

	for (var i = 0; i < users.length; i++) {
		if (users[i].user.username === newUsername) {
			nameTaken = true;
			break;
		}

		if (users[i].user.id === userId) {
			idx = i;
		}
	}

	if (nameTaken) {
		socket.emit('changeUsernameRes', { success: false, error: "The username is already taken." });
	}
	else if (idx === -1) {
		socket.emit('changeUsernameRes', { sucess: false, error: "A user by the given id was not found." });
	}
	else {
		users[idx].user.username = newUsername;

		socket.emit('changeUsernameRes', { success: true, error: null });
		io.sockets.emit('userChangedUsername', { userId: userId, newUsername: newUsername });	
	}
};

function onSendMessage(data) {
	var idx = -1;
	for (var i = 0; i < users.length; i++) {
		if (users[i].user.id === data.userId) {
			idx = i;
			break;
		}
	}

	if (idx > -1) {
		var username = users[idx].user.username;
		io.sockets.emit('userSendMessage', { 
			userId: data.userId,
			username: username,
			message: data.message
		});
	}
};

function generateId() {
	var id = 0;

	while (id === 0) {
		id = Math.floor((Math.random() * 9000) + 1000);

		for (var i = 0; i < users.length; i++) {
			if (users[i].id === id) {
				id = 0;
				break;
			}
		}
	}

	return id;
};