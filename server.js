var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.use('/public/assets', express.static(__dirname + '/public/assets'));

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(8081, function() { // Listens to port 8081
    console.log('Listening on ' + server.address().port);
});

io.sockets.on('connection', function (socket) {
	socket.emit('connected');

	socket.on('createNewGame', createNewGame);
	socket.on('playerJoinGame', playerJoinGame);
	socket.on('startGame', startGame);
	socket.on('masterChosen', chooseMaster);
});


// CONTACT

var rooms = [];

function createNewGame(data) {

	var room = {
		players: [],
		master: null,
		gameID: data.gameID,
	};

	rooms.push(room);

	this.emit('new_game_created', data);
};

function playerJoinGame(data) {
	var socket = this;
	var room = getRoomByID(data.gameID);

	var player = {
		myName: data.playerName,
		// myRole: data.role,
		pairs: [],
	}

	if (room != null) {
	socket.join(room.gameID);
	room.players.push(player);
    console.log('Player ' + player.myName + ' joining game: ' + room.gameID);
    io.sockets.in(room.gameID).emit('player_joined_game', room);
	}
	else {
	console.log("Game does not exist.");
	}

	// if (room.players.length >= 3) {
	// 	io.sockets.in(room.gameID).emit('game_started');
	// }
};

function startGame(gameID) {
	var room = getRoomByID(gameID);
	if (room.master == null) {
		room.master = room.players[Math.floor(Math.random() * room.players.length)];
	}
	io.sockets.in(gameID).emit('game_started', room.master);
}

function chooseMaster(data) {
	var room = getRoomByID(data.gameID);

	if (data.playerName != null) {
		room.master = getPlayerByName({room: room, playerName: data.playerName});
	} 
	else {
		room.master = null;
	}

	io.sockets.in(data.gameID).emit('master_chosen', room.master);
}

function getRoomByID(gameID) {
	return rooms.find(r => r.gameID == gameID);
};

function getPlayerByName(data) {
	var room = data.room;
	return room.players.find(p => p.myName == data.playerName);
}